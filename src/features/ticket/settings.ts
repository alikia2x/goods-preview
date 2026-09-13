import type { StudioSettings } from "@/features/studio/settings";
// Only what a person can change. The coating's render parameters live in
// `@/tuning/products/ticket` and are read by the material instead.
export type TicketSettings = StudioSettings & {
	finish: "laser" | "glitter" | "silver";
	pose: "standing" | "flat";
};
export const TICKET_FINISHES = {
	laser: "镭射覆膜",
	glitter: "闪粉覆膜",
	silver: "镭射银",
};
