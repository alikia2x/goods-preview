import type { StandeeSettings } from "@/features/acrylic/settings";

// 亚克力立牌
export const STANDEE_DEFAULTS = {
	scene: "table",
	lighting: "studioContrast",
	light: 50,
	lightAzimuth: -35,
	lightElevation: 40,
	shadow: 65,
	gloss: 85,
	size: 60,
	transparentBackground: false,
	thickness: 3,
	border: 2,
	baseDiameter: 55,
	connectorWidth: 18,
	connectorHeight: 4,
	connectorX: 0,
	connectorY: 3,
} satisfies StandeeSettings;
