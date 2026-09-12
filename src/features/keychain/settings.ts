import type { AcrylicSheetSettings } from "@/features/acrylic/settings";

export type KeychainHardware = "ring" | "clasp";
export type KeychainHardwareColor = "silver" | "gold";

// 亚克力钥匙扣 — the sheet plus the hardware that hangs it.
export type KeychainSettings = AcrylicSheetSettings & {
	hardware: KeychainHardware;
	hardwareColor: KeychainHardwareColor;
};
