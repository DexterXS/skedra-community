export type BillingAccessSource =
	| "subscription"
	| "complimentary"
	| "none"
	| "selfhost";

export type PaidPlanCode = "pro_monthly" | "pro_yearly";

/**
 * A user who explicitly selected a paid plan may enter Checkout even while a
 * complimentary Founding User trial grants product access. Existing paid
 * subscriptions still use the customer portal instead of creating another
 * subscription.
 */
export function shouldStartSelectedCheckout(input: {
	startRequested: boolean;
	plan: PaidPlanCode | undefined;
	accessGranted: boolean;
	accessSource: BillingAccessSource | undefined;
}) {
	if (!input.startRequested || !input.plan) return false;
	return !input.accessGranted || input.accessSource === "complimentary";
}
