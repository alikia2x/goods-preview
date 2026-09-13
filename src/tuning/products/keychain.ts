import type { KeychainSettings } from "@/features/keychain/settings";

// 亚克力钥匙扣
export const KEYCHAIN_DEFAULTS = {
	scene: "standing",
	lighting: "studioSmall09",
	light: 50,
	lightAzimuth: -26.57,
	lightElevation: 30.8,
	shadow: 26,
	gloss: 85,
	size: 60,
	transparentBackground: false,
	positionOffsetZ: 0,
	thickness: 3,
	border: 2,
	windowStrength: 100,
	hardware: "ring",
	hardwareColor: "silver",
} satisfies KeychainSettings;
