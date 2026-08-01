export type SignupPlanCode = "pro_monthly" | "pro_yearly";

export function safeSignupRedirect(
	value: string | null,
	fallback = "/library",
) {
	return value?.startsWith("/") &&
		!value.startsWith("//") &&
		!value.includes("\\")
		? value
		: fallback;
}

export function buildPostSignupRedirect(input: {
	managed: boolean;
	plan: SignupPlanCode | null;
	redirect: string;
}) {
	if (!input.managed || !input.plan) return input.redirect;
	return `/subscribe?${new URLSearchParams({
		plan: input.plan,
		checkout: "start",
		redirect: input.redirect,
	}).toString()}`;
}

export function buildEmailSignupPayload(input: {
	name: string;
	email: string;
	password: string;
	inviteToken?: string;
	callbackURL: string;
}) {
	return {
		name: input.name,
		email: input.email,
		password: input.password,
		inviteToken: input.inviteToken,
		callbackURL: input.callbackURL,
	};
}
