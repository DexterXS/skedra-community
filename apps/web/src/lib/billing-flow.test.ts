import assert from "node:assert/strict";
import { test } from "node:test";
import {
	formatFoundingTrialLabel,
	shouldStartSelectedCheckout,
} from "./billing-flow";

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

test("Founding User copy follows the configured trial duration", () => {
	assert.equal(
		formatFoundingTrialLabel(14, "de"),
		"14 Tage Founding-User-Zugang",
	);
	assert.equal(
		formatFoundingTrialLabel(45, "en"),
		"45-day Founding User access",
	);
	assert.equal(formatFoundingTrialLabel(0, "de"), null);
});
