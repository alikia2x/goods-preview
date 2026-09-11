import { ORIGINAL_LIGHT_ANGLES } from "../studio/lighting";
import type { LightingPreset } from "../studio/lighting-presets";
import type { SceneKind } from "../studio/scenes";

export type KeychainHardware = "ring" | "clasp";
export type KeychainHardwareColor = "silver" | "gold";

export type KeychainSettings = {
	size: number;
	thickness: number;
	border: number;
	gloss: number;
	hardware: KeychainHardware;
	hardwareColor: KeychainHardwareColor;
	scene: SceneKind;
	lighting: LightingPreset;
	light: number;
	lightAzimuth: number;
	lightElevation: number;
	shadow: number;
	transparentBackground: boolean;
};

export type KeychainSettingChange = <K extends keyof KeychainSettings>(
	key: K,
	value: KeychainSettings[K],
) => void;

export const DEFAULT_KEYCHAIN_SETTINGS: KeychainSettings = {
	size: 60,
	thickness: 3,
	border: 2,
	gloss: 85,
	hardware: "ring",
	hardwareColor: "silver",
	scene: "standing",
	lighting: "hdr",
	light: 50,
	lightAzimuth: ORIGINAL_LIGHT_ANGLES.azimuth,
	lightElevation: ORIGINAL_LIGHT_ANGLES.elevation,
	shadow: 26,
	transparentBackground: false,
};
