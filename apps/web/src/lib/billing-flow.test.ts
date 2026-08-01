import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldStartSelectedCheckout } from "./billing-flow";

test("an explicitly selected paid plan starts Checkout during a complimentary trial", () => {
	assert.equal(
		shouldStartSelectedCheckout({
			startRequested: true,
			plan: "pro_yearly",
			accessGranted: true,
			accessSource: "complimentary",
		}),
		true,
	);
});

test("an existing paid subscription never starts a duplicate Checkout", () => {
	assert.equal(
		shouldStartSelectedCheckout({
			startRequested: true,
			plan: "pro_monthly",
			accessGranted: true,
			accessSource: "subscription",
		}),
		false,
	);
});

test("ordinary paywall visits do not auto-start Checkout", () => {
	assert.equal(
		shouldStartSelectedCheckout({
			startRequested: false,
			plan: "pro_monthly",
			accessGranted: false,
			accessSource: "none",
		}),
		false,
	);
});
