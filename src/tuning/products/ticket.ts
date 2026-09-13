import type { TicketSettings } from "@/features/ticket/settings";
export const TICKET_DEFAULTS: TicketSettings = {
	scene: "table",
	lighting: "studioSmall09",
	light: 50,
	lightAzimuth: -26.57,
	lightElevation: 30.8,
	shadow: 26,
	gloss: 75,
	size: 150,
	transparentBackground: false,
	finish: "laser",
	pose: "flat",
};

// The coating shader's numbers. They are not settings: no control changes them,
// so they stay out of `TicketSettings` and the material reads them from here.
// One group per finish; values reach the shader as uniforms.
export const TICKET_COATING = {
	foil: {
		// Pattern scale of the diffraction field, and how far a change of view
		// angle slides it across the sheet.
		scale: 10,
		motion: 240,
		// How much noise warps the field before it is thresholded.
		distortion: 40,
		// Coverage of the exposed foil, its brightness, and the frequency of the
		// interference colour across it.
		threshold: 89,
		brightness: 90,
		spectrum: 50,
	},
	glitter: {
		// Grains per sheet and how large each one is.
		density: 400,
		size: 50,
		// Width of the angular window that lights a grain.
		sharpness: 200,
		// Angular sparkle frequency; larger values change active grains faster.
		motion: 100,
	},
	silver: {
		// Where no ink covers the sheet, the print gives way to this grey
		// substrate; it reflects at `reflection` strength with `roughness`.
		substrate: 0.72,
		roughness: 0.26,
		reflection: 2.5,
		// Interference colour: the colourless coating, how far the spectrum
		// replaces it, and the angle window and field strength that decide when
		// colour shows at all.
		tintBase: 0.85,
		colorMix: 0.92,
		colorRange: [-0.35, 0.55],
		colorAngle: [5.5, 3],
		colorField: 1.8,
		// The diffraction field: pattern scale, view-angle slide, noise offset,
		// and the phase that the field strength and the view direction add.
		fieldScale: 1.8,
		fieldAngle: 1.25,
		fieldOffset: 13.7,
		phaseField: 9,
		phaseAngle: [6, 4],
	},
};
