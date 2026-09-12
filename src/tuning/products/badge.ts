import type { BadgeSettings } from "@/features/badge/settings";

// 覆膜吧唧
export const BADGE_DEFAULTS = {
	finish: "glossy",
	lighting: "photoStudio01",
	shadow: 26,
	scene: "table",
	light: 50,
	lightAzimuth: 19.4,
	lightElevation: 38.01,
	gloss: 50,
	size: 65,
	bleed: 0,
	pose: "flat",
	transparentBackground: false,
} satisfies BadgeSettings;
