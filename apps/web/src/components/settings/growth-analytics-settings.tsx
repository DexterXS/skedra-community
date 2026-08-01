import { trpc } from "@/lib/trpc";
import { BarChart3, Loader2, RotateCcw, ShieldCheck } from "lucide-react";

const LABELS: Record<string, string> = {
	page_view: "Seitenaufrufe",
	canvas_activated: "Canvas aktiviert",
	export_used: "Export genutzt",
	cloud_intent: "Cloud-Interesse",
	signup_started: "Registrierung gestartet",
	signup_completed: "Registrierung abgeschlossen",
	checkout_started: "Checkout gestartet",
	checkout_completed: "Checkout abgeschlossen",
	collaboration_started: "Zusammenarbeit gestartet",
	share_viewed: "Öffentliches Board angesehen",
	share_link_copied: "Share-Link kopiert",
	mcp_setup_viewed: "MCP-Setup angesehen",
	mcp_key_created: "MCP-Key erstellt",
	template_used: "Öffentliche Vorlage übernommen",
};

export function GrowthAnalyticsSettings() {
	const { data, isLoading } = trpc.growth.getOverview.useQuery();

	if (isLoading) {
		return (
			<div className="flex min-h-48 items-center justify-center rounded-2xl border border-border bg-card">
				<Loader2 className="h-5 w-5 animate-spin text-primary" />
			</div>
		);
	}
	if (!data?.canView) return null;

	const pageVisitors =
		data.stages.find((stage) => stage.event === "page_view")?.visitors ?? 0;

	return (
		<div className="space-y-6 animate-in fade-in-50 duration-200">
			<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
				<div className="flex items-start gap-3">
					<div className="rounded-xl bg-primary/10 p-2 text-primary">
						<BarChart3 className="h-5 w-5" />
					</div>
					<div>
						<h2 className="text-lg font-semibold">Growth-Funnel · 30 Tage</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Produktaktivierung, Cloud-Intent, Signup, Checkout, Shares und MCP
							in einer Ansicht.
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<RotateCcw className="h-4 w-4 text-primary" /> Rückkehr in 7 Tagen
					</div>
					<p className="mt-3 text-3xl font-semibold tabular-nums">
						{data.retention.rate === null
							? "–"
							: `${(data.retention.rate * 100).toFixed(1)} %`}
					</p>
				</div>
				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<p className="text-sm font-medium text-muted-foreground">
						Wiederkehrer / auswertbar
					</p>
					<p className="mt-3 text-3xl font-semibold tabular-nums">
						{data.retention.returningVisitors} /{" "}
						{data.retention.eligibleVisitors}
					</p>
				</div>
				<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
					<p className="text-sm font-medium text-muted-foreground">
						Noch im 7-Tage-Fenster
					</p>
					<p className="mt-3 text-3xl font-semibold tabular-nums">
						{data.retention.pendingVisitors}
					</p>
				</div>
			</div>

			<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
				<div className="grid grid-cols-[minmax(0,1fr)_88px_88px_88px] gap-3 border-b border-border bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					<span>Ereignis</span>
					<span className="text-right">Nutzer</span>
					<span className="text-right">Events</span>
					<span className="text-right">Rate</span>
				</div>
				{data.stages.map((stage) => {
					const conversion =
						pageVisitors > 0
							? `${((stage.visitors / pageVisitors) * 100).toFixed(1)} %`
							: "–";
					return (
						<div
							key={stage.event}
							className="grid grid-cols-[minmax(0,1fr)_88px_88px_88px] gap-3 border-b border-border/70 px-5 py-3 text-sm last:border-none"
						>
							<span className="truncate font-medium">
								{LABELS[stage.event] ?? stage.event}
							</span>
							<span className="text-right tabular-nums">{stage.visitors}</span>
							<span className="text-right tabular-nums text-muted-foreground">
								{stage.events}
							</span>
							<span className="text-right tabular-nums text-muted-foreground">
								{conversion}
							</span>
						</div>
					);
				})}
			</div>

			<div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm text-muted-foreground">
				<ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
				<p>
					Inhaltssicher: Skedra erfasst keine Boardnamen, Canvas-Inhalte,
					Prompts, E-Mail-Adressen oder Share-Tokens. Kennungen werden vor dem
					Speichern einseitig gehasht. Die einwilligungsbasierte Browserkennung
					läuft nach acht Tagen ab; die Sitzungskennung mit dem Browser-Tab.
				</p>
			</div>
		</div>
	);
}
