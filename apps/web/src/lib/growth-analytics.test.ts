import assert from "node:assert/strict";
import { test } from "node:test";

class MemoryStorage implements Storage {
	private readonly values = new Map<string, string>();

	get length() {
		return this.values.size;
	}

	clear() {
		this.values.clear();
	}

	getItem(key: string) {
		return this.values.get(key) ?? null;
	}

	key(index: number) {
		return Array.from(this.values.keys())[index] ?? null;
	}

	removeItem(key: string) {
		this.values.delete(key);
	}

	setItem(key: string, value: string) {
		this.values.set(key, value);
	}
}

test("growth events wait for consent and use an expiring cross-session visitor id", async () => {
	const local = new MemoryStorage();
	const session = new MemoryStorage();
	const requests: Array<{ url: string; body: string }> = [];
	const originals = new Map(
		["window", "document", "localStorage", "sessionStorage", "fetch"].map(
			(key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)],
		),
	);

	Object.defineProperties(globalThis, {
		window: {
			configurable: true,
			value: {
				location: {
					origin: "https://skedra.example",
					pathname: "/mcp",
					search: "?utm_source=test",
				},
				dispatchEvent: () => true,
			},
		},
		document: {
			configurable: true,
			value: { referrer: "https://example.org/post" },
		},
		localStorage: { configurable: true, value: local },
		sessionStorage: { configurable: true, value: session },
		fetch: {
			configurable: true,
			value: async (url: string, init: RequestInit) => {
				requests.push({ url, body: String(init.body) });
				return new Response(null, { status: 204 });
			},
		},
	});

	try {
		const analytics = await import("./growth-analytics");
		assert.equal(analytics.getGrowthAnalyticsConsent(), "undecided");
		assert.equal(analytics.trackGrowthEvent("page_view"), true);
		assert.equal(requests.length, 0);
		assert.equal(local.getItem("skedra-growth-visitor-v1"), null);

		const beforeGrant = Date.now();
		analytics.setGrowthAnalyticsConsent("granted");
		assert.equal(requests.length, 1);
		assert.match(requests[0]?.url ?? "", /\/api\/analytics\/events$/u);
		const visitor = JSON.parse(
			local.getItem("skedra-growth-visitor-v1") ?? "null",
		) as { id: string; expiresAt: number };
		assert.match(visitor.id, /^[0-9a-f-]{36}$/u);
		assert.ok(visitor.expiresAt >= beforeGrant + 7 * 24 * 60 * 60 * 1000);
		assert.ok(
			visitor.expiresAt <= beforeGrant + 8 * 24 * 60 * 60 * 1000 + 1000,
		);
		assert.ok(session.getItem("skedra-growth-session-v1"));

		analytics.setGrowthAnalyticsConsent("denied");
		assert.equal(local.getItem("skedra-growth-visitor-v1"), null);
		assert.equal(session.getItem("skedra-growth-session-v1"), null);
	} finally {
		for (const [key, descriptor] of originals) {
			if (descriptor) Object.defineProperty(globalThis, key, descriptor);
			else Reflect.deleteProperty(globalThis, key);
		}
	}
});
