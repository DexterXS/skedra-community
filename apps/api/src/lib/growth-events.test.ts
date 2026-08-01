import assert from "node:assert/strict";
import { test } from "node:test";
import {
	consumeGrowthEventRateLimit,
	resetGrowthEventRateLimitsForTests,
	sanitizeGrowthPathname,
} from "./growth-events";

test("growth analytics strips board ids, share tokens and query strings", () => {
	assert.equal(
		sanitizeGrowthPathname(
			"/board/8c083140-7c43-4edc-a44a-8a7b81a8086f?secret=value",
		),
		"/board/:id",
	);
	assert.equal(
		sanitizeGrowthPathname("/collab/a-private-share-token#key-fragment"),
		"/collab/:token",
	);
	assert.equal(
		sanitizeGrowthPathname("/embed/another-token/extra"),
		"/embed/:token/extra",
	);
});

test("growth analytics limits each client to 120 events per minute", () => {
	resetGrowthEventRateLimitsForTests();
	for (let index = 0; index < 120; index += 1) {
		assert.equal(consumeGrowthEventRateLimit("client", 1_000), true);
	}
	assert.equal(consumeGrowthEventRateLimit("client", 1_000), false);
	assert.equal(consumeGrowthEventRateLimit("client", 61_000), true);
	resetGrowthEventRateLimitsForTests();
});

test("growth analytics bounds the number of in-memory client buckets", () => {
	resetGrowthEventRateLimitsForTests();
	for (let index = 0; index < 10_000; index += 1) {
		assert.equal(consumeGrowthEventRateLimit(`client-${index}`, 1_000), true);
	}
	assert.equal(consumeGrowthEventRateLimit("client-overflow", 1_000), false);
	assert.equal(consumeGrowthEventRateLimit("client-overflow", 61_000), true);
	resetGrowthEventRateLimitsForTests();
});
