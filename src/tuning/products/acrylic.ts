import type { AcrylicSettings } from "@/features/acrylic/settings";

// 任意亚克力
export const ACRYLIC_DEFAULTS = {
	scene: "standing",
	lighting: "hdr",
	light: 50,
	lightAzimuth: -36.8699,
	lightElevation: 50.1944,
	shadow: 26,
	gloss: 85,
	size: 60,
	transparentBackground: false,
	thickness: 3,
	border: 2,
} satisfies AcrylicSettings;
