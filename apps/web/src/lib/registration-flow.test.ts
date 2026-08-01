import assert from "node:assert/strict";
import { test } from "node:test";
import {
	buildEmailSignupPayload,
	buildPostSignupRedirect,
	safeSignupRedirect,
} from "./registration-flow";

test("paid email signup preserves Checkout through email verification", () => {
	const callbackURL = buildPostSignupRedirect({
		managed: true,
		plan: "pro_yearly",
		redirect: "/settings?tab=billing",
	});
	assert.equal(
		callbackURL,
		"/subscribe?plan=pro_yearly&checkout=start&redirect=%2Fsettings%3Ftab%3Dbilling",
	);
	assert.equal(
		buildEmailSignupPayload({
			name: "Paid User",
			email: "paid@example.test",
			password: "secret-password",
			callbackURL,
		}).callbackURL,
		callbackURL,
	);
});

test("signup redirects reject external and protocol-relative targets", () => {
	assert.equal(safeSignupRedirect("https://attacker.example"), "/library");
	assert.equal(safeSignupRedirect("//attacker.example"), "/library");
	assert.equal(safeSignupRedirect("/library"), "/library");
});
