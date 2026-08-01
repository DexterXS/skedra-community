import type { CanvasThemeState } from "@/lib/canvas/canvas-defaults";
import { getCanvasElementFactoryDefaults } from "@/lib/canvas/canvas-factory-defaults";
import { getCurrentLocale } from "@/stores/locale";
import {
	type CanvasElement,
	createBaseCanvasElement,
	createGanttChartElements,
	createKanbanBoardElements,
} from "@skedra/canvas-core";
import { ganttAppearance, ganttDateLabel } from "./gantt";

export function createAiLaunchTemplate(
	cx: number,
	cy: number,
	theme?: CanvasThemeState,
): CanvasElement[] {
	const defaults = getCanvasElementFactoryDefaults(theme);
	const english = getCurrentLocale() === "en";
	const title = createBaseCanvasElement(defaults, {
		type: "text",
		x: cx - 700,
		y: cy - 620,
		width: 1150,
		height: 70,
		fill: "transparent",
		stroke: "transparent",
		strokeWidth: 0,
		text: english
			? "AI Product Launch · Demo Board"
			: "AI-Produktlaunch · Demo-Board",
		fontSize: 34,
		fontFamily: defaults.kanbanFontFamily ?? defaults.fontFamily,
		textAlign: "left",
	});
	const subtitle = createBaseCanvasElement(defaults, {
		type: "text",
		x: cx - 700,
		y: cy - 555,
		width: 1150,
		height: 52,
		fill: "transparent",
		stroke: "transparent",
		strokeWidth: 0,
		text: english
			? "A shared plan humans and AI agents can edit together"
			: "Ein gemeinsamer Plan, den Menschen und AI-Agenten zusammen bearbeiten",
		fontSize: 18,
		fontFamily: defaults.kanbanFontFamily ?? defaults.fontFamily,
		textAlign: "left",
	});

	const kanban = createKanbanBoardElements(defaults, {
		x: cx - 700,
		y: cy - 450,
		lists: english
			? [
					{ name: "Backlog", cards: ["MCP landing page", "Community posts"] },
					{
						name: "In progress",
						cards: ["Record agent demo", "Registry package"],
					},
					{ name: "Ready", cards: ["Founding User trial", "Analytics funnel"] },
				]
			: [
					{ name: "Backlog", cards: ["MCP-Landingpage", "Community-Posts"] },
					{
						name: "In Arbeit",
						cards: ["Agenten-Demo aufnehmen", "Registry-Paket"],
					},
					{
						name: "Bereit",
						cards: ["Founding-User-Trial", "Analytics-Funnel"],
					},
				],
		defaultCardTitle: english ? "New launch task" : "Neue Launch-Aufgabe",
	});

	const tasks = english
		? [
				{
					id: "story",
					title: "Story & positioning",
					startDay: 0,
					durationDays: 4,
					progress: 100,
					status: "completed" as const,
				},
				{
					id: "demo",
					title: "Demo board & video",
					startDay: 3,
					durationDays: 6,
					progress: 55,
					status: "active" as const,
				},
				{
					id: "docs",
					title: "MCP docs & registry",
					startDay: 5,
					durationDays: 5,
					progress: 35,
					status: "active" as const,
				},
				{
					id: "launch",
					title: "Community launch",
					startDay: 11,
					durationDays: 1,
					progress: 0,
					status: "planned" as const,
					milestone: true,
				},
			]
		: [
				{
					id: "story",
					title: "Story & Positionierung",
					startDay: 0,
					durationDays: 4,
					progress: 100,
					status: "completed" as const,
				},
				{
					id: "demo",
					title: "Demo-Board & Video",
					startDay: 3,
					durationDays: 6,
					progress: 55,
					status: "active" as const,
				},
				{
					id: "docs",
					title: "MCP-Doku & Registry",
					startDay: 5,
					durationDays: 5,
					progress: 35,
					status: "active" as const,
				},
				{
					id: "launch",
					title: "Community-Launch",
					startDay: 11,
					durationDays: 1,
					progress: 0,
					status: "planned" as const,
					milestone: true,
				},
			];
	const gantt = createGanttChartElements(defaults, {
		x: cx - 700,
		y: cy + 90,
		title: english ? "Launch timeline" : "Launch-Zeitachse",
		startDate: new Date().toISOString().slice(0, 10),
		dayCount: 21,
		canvasViewportDayCount: 21,
		tasks,
		dependencies: [
			{ fromTaskId: "story", toTaskId: "demo" },
			{ fromTaskId: "demo", toTaskId: "launch" },
			{ fromTaskId: "docs", toTaskId: "launch" },
		],
		appearance: ganttAppearance(theme),
		dateLabel: ganttDateLabel,
		showToday: true,
		today: new Date().toISOString().slice(0, 10),
	});

	return [title, subtitle, ...kanban, ...gantt];
}
