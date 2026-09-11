import { ORIGINAL_LIGHT_ANGLES } from "@/features/studio/lib/lighting";
import {
	DEFAULT_STUDIO_SETTINGS,
	type StudioSettings,
} from "@/features/studio/settings";

export type KeychainHardware = "ring" | "clasp";
export type KeychainHardwareColor = "silver" | "gold";

export type KeychainSettings = StudioSettings & {
	productKind: "keychain" | "acrylic" | "standee";
	baseDiameter: number;
	connectorWidth: number;
	connectorHeight: number;
	connectorX: number;
	connectorY: number;
	thickness: number;
	border: number;
	hardware: KeychainHardware;
	hardwareColor: KeychainHardwareColor;
};

export const DEFAULT_KEYCHAIN_SETTINGS: KeychainSettings = {
	...DEFAULT_STUDIO_SETTINGS,
	size: 60,
	gloss: 85,
	scene: "standing",
	light: 50,
	lightAzimuth: ORIGINAL_LIGHT_ANGLES.azimuth,
	lightElevation: ORIGINAL_LIGHT_ANGLES.elevation,
	productKind: "keychain",
	baseDiameter: 55,
	connectorWidth: 18,
	connectorHeight: 4,
	connectorX: 0,
	connectorY: 3,
	thickness: 3,
	border: 2,
	hardware: "ring",
	hardwareColor: "silver",
};
