import { Button } from "@/components/ui/button";
import {
	type GrowthAnalyticsConsent,
	getGrowthAnalyticsConsent,
	setGrowthAnalyticsConsent,
} from "@/lib/growth-analytics";
import { useI18n } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { BarChart3, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

function useGrowthConsent() {
	const [consent, setConsent] = useState<GrowthAnalyticsConsent>(() =>
		getGrowthAnalyticsConsent(),
	);

	useEffect(() => {
		const update = () => setConsent(getGrowthAnalyticsConsent());
		window.addEventListener("skedra-growth-consent-changed", update);
		return () =>
			window.removeEventListener("skedra-growth-consent-changed", update);
	}, []);

	return consent;
}

export function GrowthConsentBanner() {
	const { locale } = useI18n();
	const consent = useGrowthConsent();
	const { data: publicConfig } = trpc.billing.getPublicConfig.useQuery();

	if (!publicConfig?.managed || consent !== "undecided") return null;

	return (
		<dialog
			open
			aria-label={
				locale === "en" ? "Analytics preference" : "Analytics-Einstellung"
			}
			className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-border bg-background/96 p-4 shadow-2xl backdrop-blur sm:bottom-5 sm:flex sm:items-center sm:gap-5 sm:p-5"
		>
			<div className="flex min-w-0 flex-1 gap-3">
				<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
					<BarChart3 className="h-4 w-4" />
				</div>
				<div>
					<h2 className="font-semibold">
						{locale === "en"
							? "Help improve Skedra"
							: "Hilf uns, Skedra zu verbessern"}
					</h2>
					<p className="mt-1 text-sm leading-5 text-muted-foreground">
						{locale === "en"
							? "With your permission, Skedra records content-free product events. The browser identifier expires after eight days. No boards, prompts, emails, or share tokens are collected."
							: "Mit deiner Erlaubnis erfasst Skedra inhaltsfreie Produkt-Ereignisse. Die Browserkennung läuft nach acht Tagen ab. Boards, Prompts, E-Mails und Share-Tokens werden nicht erfasst."}
					</p>
				</div>
			</div>
			<div className="mt-4 flex shrink-0 gap-2 sm:mt-0 sm:flex-col">
				<Button size="sm" onClick={() => setGrowthAnalyticsConsent("granted")}>
					{locale === "en" ? "Allow analytics" : "Analytics erlauben"}
				</Button>
				<Button
					size="sm"
					variant="ghost"
					onClick={() => setGrowthAnalyticsConsent("denied")}
				>
					{locale === "en" ? "No, thanks" : "Nein, danke"}
				</Button>
			</div>
		</dialog>
	);
}

export function GrowthAnalyticsPrivacyControls() {
	const consent = useGrowthConsent();

	return (
		<div className="mt-4 rounded-xl border border-border bg-muted/25 p-4">
			<div className="flex gap-3">
				<ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
				<div>
					<p className="font-medium">Deine Analytics-Einstellung</p>
					<p className="mt-1 text-sm text-muted-foreground">
						Aktueller Status:{" "}
						{consent === "granted" ? "erlaubt" : "nicht erlaubt"}. Beim Widerruf
						werden die lokalen Analysekennungen sofort gelöscht.
					</p>
				</div>
			</div>
			<div className="mt-4 flex flex-wrap gap-2">
				<Button size="sm" onClick={() => setGrowthAnalyticsConsent("granted")}>
					Analytics erlauben
				</Button>
				<Button
					size="sm"
					variant="outline"
					onClick={() => setGrowthAnalyticsConsent("denied")}
				>
					Einwilligung widerrufen
				</Button>
			</div>
		</div>
	);
}
