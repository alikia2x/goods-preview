import type { ProductPositionSettings } from "@/features/studio/settings";
// Only what a person can change. The coating's render parameters live in
// `@/tuning/products/ticket` and are read by the material instead.
export type TicketSettings = ProductPositionSettings & {
	finish: "laser" | "glitter" | "silver";
	bleed: number;
	pose: "standing" | "flat";
};
export const TICKET_FINISHES = {
	laser: "镭射覆膜",
	glitter: "闪粉覆膜",
	silver: "镭射银",
};

// The 立放展示 scene always presents the ticket upright, so a flat pose cannot
// survive a switch to it.
export function deriveTicketSettings(next: TicketSettings): TicketSettings {
	if (next.scene === "standing" && next.pose !== "standing") {
		return { ...next, pose: "standing" };
	}
	return next;
}
