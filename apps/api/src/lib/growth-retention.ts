import type { Database } from "@skedra/db";

export interface SevenDayRetention {
	eligibleVisitors: number;
	returningVisitors: number;
	pendingVisitors: number;
	rate: number | null;
}

/**
 * A return requires a separate browser session on a later calendar day. This
 * prevents a second tab or an immediate same-day session from inflating the
 * seven-day retention KPI.
 */
export async function getSevenDayRetention(
	db: Database,
	input: { since: Date; eligibleCutoff: Date },
): Promise<SevenDayRetention> {
	const rows = await db.$client`
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
			where first_seen >= ${input.since}
				and first_seen <= ${input.eligibleCutoff}
		), returning as (
			select eligible.visitor_hash
			from eligible
			where exists (
				select 1
				from growth_events later_event
				where later_event.visitor_hash = eligible.visitor_hash
					and later_event.session_hash <> eligible.first_session_hash
					and later_event.created_at::date > eligible.first_seen::date
					and later_event.created_at <= eligible.first_seen + interval '7 days'
			)
		)
		select
			(select count(*) from eligible)::int as eligible_visitors,
			(select count(*) from returning)::int as returning_visitors,
			(
				select count(*)
				from first_visits
				where first_seen > ${input.eligibleCutoff}
			)::int as pending_visitors
	`;
	const row = rows[0] as
		| {
				eligible_visitors?: number;
				returning_visitors?: number;
				pending_visitors?: number;
		  }
		| undefined;
	const eligibleVisitors = Number(row?.eligible_visitors ?? 0);
	const returningVisitors = Number(row?.returning_visitors ?? 0);

	return {
		eligibleVisitors,
		returningVisitors,
		pendingVisitors: Number(row?.pending_visitors ?? 0),
		rate: eligibleVisitors > 0 ? returningVisitors / eligibleVisitors : null,
	};
}
