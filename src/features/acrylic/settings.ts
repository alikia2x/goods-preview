import type { StudioSettings } from "@/features/studio/settings";

// The sheet every acrylic product is cut from: how thick it is, how much clear
// margin is left around the artwork, and how far the 彩窗 image may colour the
// pixels the artwork leaves clear.
export type AcrylicSheetSettings = StudioSettings & {
	thickness: number;
	border: number;
	windowStrength: number;
};

// How the sheet sits on the set: standing on its cut edge, or lying face up.
export type AcrylicPose = "standing" | "flat";

// 任意亚克力 — the sheet on its own, which can stand or lie face up.
export type AcrylicSettings = AcrylicSheetSettings & {
	pose: AcrylicPose;
};

// The 立放展示 scene always presents the sheet upright, so a flat pose cannot
// survive a switch to it.
export function deriveAcrylicSettings(next: AcrylicSettings): AcrylicSettings {
	if (next.scene === "standing" && next.pose !== "standing") {
		return { ...next, pose: "standing" };
	}
	return next;
}

// 亚克力立牌 — the sheet on a base, joined to it by a connector.
export type StandeeSettings = AcrylicSheetSettings & {
	baseDiameter: number;
	connectorWidth: number;
	connectorHeight: number;
	connectorX: number;
	connectorY: number;
};
