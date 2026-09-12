import type { AcrylicSettings } from "@/features/acrylic/settings";

// 任意亚克力
export const ACRYLIC_DEFAULTS = {
	scene: "standing",
	lighting: "studioSmall09",
	light: 50,
	lightAzimuth: -26.57,
	lightElevation: 30.8,
	shadow: 26,
	gloss: 85,
	size: 60,
	transparentBackground: false,
	thickness: 3,
	border: 2,
} satisfies AcrylicSettings;
