import { growthEvents } from "@skedra/db";
import { count, countDistinct, desc, gte } from "drizzle-orm";
import { env } from "../../env";
import { growthEventNames } from "../../lib/growth-events";
import { isInstanceAdmin } from "../../lib/instance-settings";
import { authenticatedProcedure, router } from "../init";

export const growthRouter = router({
	getOverview: authenticatedProcedure.query(async ({ ctx }) => {
		if (
			env.SKEDRA_DEPLOYMENT_MODE !== "managed" ||
			!(await isInstanceAdmin(ctx.db, ctx.user.id))
		) {
			return {
				canView: false as const,
				days: 30,
				stages: [],
				retention: null,
			};
		}

		const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
		const eligibleCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const [rows, retentionRows] = await Promise.all([
			ctx.db
				.select({
					event: growthEvents.event,
					events: count(),
					visitors: countDistinct(growthEvents.visitorHash),
				})
				.from(growthEvents)
				.where(gte(growthEvents.createdAt, since))
				.groupBy(growthEvents.event)
				.orderBy(desc(count())),
			ctx.db.$client`
				with first_visits as (
					select distinct on (visitor_hash)
						visitor_hash,
						session_hash as first_session_hash,
						created_at as first_seen
					from growth_events
					order by visitor_hash, created_at asc, id asc
				), eligible as (
					select *
					from first_visits
					where first_seen >= ${since}
						and first_seen <= ${eligibleCutoff}
				), returning as (
					select eligible.visitor_hash
					from eligible
					where exists (
						select 1
						from growth_events later_event
						where later_event.visitor_hash = eligible.visitor_hash
							and later_event.session_hash <> eligible.first_session_hash
							and later_event.created_at > eligible.first_seen
							and later_event.created_at <= eligible.first_seen + interval '7 days'
					)
				)
				select
					(select count(*) from eligible)::int as eligible_visitors,
					(select count(*) from returning)::int as returning_visitors,
					(
						select count(*)
						from first_visits
						where first_seen > ${eligibleCutoff}
					)::int as pending_visitors
			`,
		]);

		const totals = new Map(
			rows.map((row) => [
				row.event,
				{ events: Number(row.events), visitors: Number(row.visitors) },
			]),
		);
		const retentionRow = retentionRows[0] as
			| {
					eligible_visitors?: number;
					returning_visitors?: number;
					pending_visitors?: number;
			  }
			| undefined;
		const eligibleVisitors = Number(retentionRow?.eligible_visitors ?? 0);
		const returningVisitors = Number(retentionRow?.returning_visitors ?? 0);

		return {
			canView: true as const,
			days: 30,
			since,
			stages: growthEventNames.map((event) => ({
				event,
				events: totals.get(event)?.events ?? 0,
				visitors: totals.get(event)?.visitors ?? 0,
			})),
			retention: {
				windowDays: 7,
				eligibleVisitors,
				returningVisitors,
				pendingVisitors: Number(retentionRow?.pending_visitors ?? 0),
				rate:
					eligibleVisitors > 0 ? returningVisitors / eligibleVisitors : null,
			},
		};
	}),
});
