import type { StudioSettings } from "@/features/studio/settings";
export type TicketSettings = StudioSettings & {
	finish: "laser" | "glitter" | "silver";
	pose: "standing" | "flat";
	foilScale: number;
	foilThreshold: number;
	foilBrightness: number;
	foilDistortion: number;
	foilMotion: number;
	foilSpectrum: number;
	glitterDensity: number;
	glitterSize: number;
	glitterSharpness: number;
	glitterMotion: number;
};
export const TICKET_FINISHES = {
	laser: "镭射覆膜",
	glitter: "闪粉覆膜",
	silver: "镭射银",
};
