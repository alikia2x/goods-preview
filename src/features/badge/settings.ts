import { FINISHES, type Finish } from "@/features/badge/model/finishes";
import type { StudioSettings } from "@/features/studio/settings";

export type BadgeSettings = StudioSettings & {
	finish: Finish;
	bleed: number;
};

export type BadgeView = "front" | "angle" | "back";

// Choosing a finish also selects the matching lighting preset and gloss level.
export function deriveBadgeSettings(
	next: BadgeSettings,
	key: keyof BadgeSettings,
): BadgeSettings {
	if (key !== "finish") return next;
	return {
		...next,
		lighting: "hdr",
		gloss: FINISHES[next.finish].defaultGloss,
	};
}
