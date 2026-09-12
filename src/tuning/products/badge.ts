import type { BadgeSettings } from "@/features/badge/settings";

// 覆膜吧唧
export const BADGE_DEFAULTS = {
	finish: "glossy",
	lighting: "hdr",
	shadow: 26,
	scene: "table",
	light: 72,
	lightAzimuth: 19.4,
	lightElevation: 38.01,
	gloss: 50,
	size: 65,
	bleed: 0,
	pose: "standing",
	transparentBackground: false,
} satisfies BadgeSettings;
