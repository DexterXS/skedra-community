import { growthEvents } from "@skedra/db";
import { count, countDistinct, desc, gte } from "drizzle-orm";
import { env } from "../../env";
import { growthEventNames } from "../../lib/growth-events";
import { getSevenDayRetention } from "../../lib/growth-retention";
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
		const [rows, retention] = await Promise.all([
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
			getSevenDayRetention(ctx.db, { since, eligibleCutoff }),
		]);

		const totals = new Map(
			rows.map((row) => [
				row.event,
				{ events: Number(row.events), visitors: Number(row.visitors) },
			]),
		);
		return {
			canView: true as const,
			days: 30,
			since,
			stages: growthEventNames.map((event) => ({
				event,
				events: totals.get(event)?.events ?? 0,
				visitors: totals.get(event)?.visitors ?? 0,
			})),
			retention: { windowDays: 7, ...retention },
		};
	}),
});
