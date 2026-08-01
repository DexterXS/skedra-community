import assert from "node:assert/strict";
import { test } from "node:test";
import type { Database } from "@skedra/db";
import { getSevenDayRetention } from "./growth-retention";

test("seven-day retention requires a separate session on a later day", async () => {
	let query = "";
	const db = {
		$client: (strings: TemplateStringsArray) => {
			query = strings.join("?");
			return Promise.resolve([
				{
					eligible_visitors: 4,
					returning_visitors: 1,
					pending_visitors: 2,
				},
			]);
		},
	} as unknown as Database;

	const retention = await getSevenDayRetention(db, {
		since: new Date("2026-07-01T00:00:00.000Z"),
		eligibleCutoff: new Date("2026-07-24T00:00:00.000Z"),
	});

	assert.match(
		query,
		/later_event\.session_hash <> eligible\.first_session_hash/u,
	);
	assert.match(
		query,
		/later_event\.created_at::date > eligible\.first_seen::date/u,
	);
	assert.deepEqual(retention, {
		eligibleVisitors: 4,
		returningVisitors: 1,
		pendingVisitors: 2,
		rate: 0.25,
	});
});
