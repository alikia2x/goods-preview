import type { StandeeSettings } from "@/features/acrylic/settings";

// 亚克力立牌
export const STANDEE_DEFAULTS = {
	scene: "standing",
	lighting: "photoStudio01",
	light: 50,
	lightAzimuth: -34.35,
	lightElevation: 38.85,
	shadow: 65,
	gloss: 85,
	size: 120,
	transparentBackground: false,
	thickness: 3,
	border: 2,
	windowStrength: 100,
	baseDiameter: 55,
	connectorWidth: 18,
	connectorHeight: 4,
	connectorX: 0,
	connectorY: 3,
} satisfies StandeeSettings;
