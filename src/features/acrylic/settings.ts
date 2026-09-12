import type { StudioSettings } from "@/features/studio/settings";

// The sheet every acrylic product is cut from: how thick it is, and how much
// clear margin is left around the artwork.
export type AcrylicSheetSettings = StudioSettings & {
	thickness: number;
	border: number;
};

// 任意亚克力 — the sheet on its own.
export type AcrylicSettings = AcrylicSheetSettings;

// 亚克力立牌 — the sheet on a base, joined to it by a connector.
export type StandeeSettings = AcrylicSheetSettings & {
	baseDiameter: number;
	connectorWidth: number;
	connectorHeight: number;
	connectorX: number;
	connectorY: number;
};
