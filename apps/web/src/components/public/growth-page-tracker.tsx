import { trackGrowthEvent } from "@/lib/growth-analytics";
import { useEffect } from "react";
import { useLocation } from "react-router";

export function GrowthPageTracker() {
	const { pathname } = useLocation();

	useEffect(() => {
		trackGrowthEvent("page_view", { pathname });
	}, [pathname]);

	return null;
}
