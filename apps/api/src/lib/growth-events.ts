import { createHmac } from "node:crypto";
import { type Database, growthEvents } from "@skedra/db";
import { lt } from "drizzle-orm";
import { z } from "zod";
import { env } from "../env";

export const growthEventNames = [
	"page_view",
	"canvas_activated",
	"export_used",
	"cloud_intent",
	"signup_started",
	"signup_completed",
	"checkout_started",
	"checkout_completed",
	"collaboration_started",
	"share_viewed",
	"share_link_copied",
	"mcp_setup_viewed",
	"mcp_key_created",
	"template_used",
] as const;

export const growthEventInputSchema = z.object({
	event: z.enum(growthEventNames),
	visitorId: z.string().uuid(),
	sessionId: z.string().uuid(),
	pathname: z.string().min(1).max(240),
	context: z
		.string()
		.max(64)
		.regex(/^[a-z0-9_./:-]+$/i)
		.optional(),
	referrerHost: z.string().max(255).optional(),
	utmSource: z.string().max(80).optional(),
	utmMedium: z.string().max(80).optional(),
	utmCampaign: z.string().max(120).optional(),
});

export type GrowthEventInput = z.infer<typeof growthEventInputSchema>;
let lastRetentionCleanupAt = 0;
const GROWTH_RATE_LIMIT_WINDOW_MS = 60_000;
const GROWTH_RATE_LIMIT_MAX_EVENTS = 120;
const GROWTH_RATE_LIMIT_MAX_CLIENTS = 10_000;
const growthRateLimits = new Map<
	string,
	{ windowStartedAt: number; count: number }
>();
let lastRateLimitCleanupAt = 0;

/** Fixed-window protection for the unauthenticated browser analytics endpoint. */
export function consumeGrowthEventRateLimit(key: string, now = Date.now()) {
	if (now - lastRateLimitCleanupAt >= GROWTH_RATE_LIMIT_WINDOW_MS) {
		lastRateLimitCleanupAt = now;
		for (const [storedKey, bucket] of growthRateLimits) {
			if (now - bucket.windowStartedAt >= GROWTH_RATE_LIMIT_WINDOW_MS) {
				growthRateLimits.delete(storedKey);
			}
		}
	}

	const bucket = growthRateLimits.get(key);
	if (!bucket || now - bucket.windowStartedAt >= GROWTH_RATE_LIMIT_WINDOW_MS) {
		if (!bucket && growthRateLimits.size >= GROWTH_RATE_LIMIT_MAX_CLIENTS) {
			return false;
		}
		growthRateLimits.set(key, { windowStartedAt: now, count: 1 });
		return true;
	}
	if (bucket.count >= GROWTH_RATE_LIMIT_MAX_EVENTS) return false;
	bucket.count += 1;
	return true;
}

export function resetGrowthEventRateLimitsForTests() {
	growthRateLimits.clear();
	lastRateLimitCleanupAt = 0;
}

function hashIdentifier(value: string, purpose: "visitor" | "session") {
	return createHmac("sha256", env.AUTH_SECRET)
		.update(`growth:${purpose}:${value}`)
		.digest("hex");
}

function cleanText(value: string | undefined) {
	const cleaned = Array.from(value?.trim() ?? "")
		.filter((character) => {
			const code = character.charCodeAt(0);
			return code >= 32 && code !== 127;
		})
		.join("");
	return cleaned || null;
}

/** Strip identifiers, tokens and query strings even if a client sends them. */
export function sanitizeGrowthPathname(value: string) {
	const path = value.split(/[?#]/u, 1)[0] || "/";
	return path
		.replace(/\/(board)\/[^/]+/giu, "/$1/:id")
		.replace(/\/(present|collab|embed)\/[^/]+/giu, "/$1/:token")
		.slice(0, 160);
}

export async function recordGrowthEvent(db: Database, input: GrowthEventInput) {
	if (env.SKEDRA_DEPLOYMENT_MODE !== "managed") return false;

	await db.insert(growthEvents).values({
		event: input.event,
		visitorHash: hashIdentifier(input.visitorId, "visitor"),
		sessionHash: hashIdentifier(input.sessionId, "session"),
		pathname: sanitizeGrowthPathname(input.pathname),
		context: cleanText(input.context),
		referrerHost: cleanText(input.referrerHost),
		utmSource: cleanText(input.utmSource),
		utmMedium: cleanText(input.utmMedium),
		utmCampaign: cleanText(input.utmCampaign),
	});

	const now = Date.now();
	if (now - lastRetentionCleanupAt > 24 * 60 * 60 * 1000) {
		lastRetentionCleanupAt = now;
		await db
			.delete(growthEvents)
			.where(
				lt(growthEvents.createdAt, new Date(now - 180 * 24 * 60 * 60 * 1000)),
			);
	}

	return true;
}
