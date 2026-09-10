import { ORIGINAL_LIGHT_ANGLES } from "../studio/lighting";
import type { LightingPreset } from "../studio/lighting-presets";
import type { SceneKind } from "../studio/scenes";

export type KeychainSettings = {
	size: number;
	thickness: number;
	border: number;
	gloss: number;
	hardware: "ring" | "clasp";
	scene: SceneKind;
	lighting: LightingPreset;
	light: number;
	lightAzimuth: number;
	lightElevation: number;
	shadow: number;
};
export const DEFAULT_KEYCHAIN_SETTINGS: KeychainSettings = {
	size: 60,
	thickness: 3,
	border: 2,
	gloss: 85,
	hardware: "ring",
	scene: "standing",
	lighting: "hdr",
	light: 50,
	lightAzimuth: ORIGINAL_LIGHT_ANGLES.azimuth,
	lightElevation: ORIGINAL_LIGHT_ANGLES.elevation,
	shadow: 26,
};
