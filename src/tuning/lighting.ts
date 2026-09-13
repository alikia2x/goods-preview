// A product is lit by two passes of the same capture: the environment map the
// material reflects, and the emitters sampled out of it for the key light. Left
// alone they light the product twice and leave its shadow illuminated from every
// direction, so the two passes share one budget instead.
//
// The environment fills the product evenly, including the faces the emitters
// cannot reach; the emitters give it direction and cast its shadows. Weighting
// the environment too lightly is what makes a product read dark and flat from
// behind, so the ambient keeps the larger share.
export const AMBIENT_IBL_SHARE = 0.6;
export const RIG_RATIO = 1 - AMBIENT_IBL_SHARE;

// Products resolved 20% of the environment diffusely before the two passes were
// balanced. The black scene, and the set surfaces tuned alongside it, keep that
// split.
export const LEGACY_AMBIENT_IBL_SHARE = 0.2;

// Irradiance a white surface facing the product normal receives at light = 50,
// once the environment and the emitters have split the budget between them. A
// capture is exposed by what it delivers rather than by how concentrated its
// emitters are, so swapping one capture for another changes the character of the
// light, not the exposure.
export const REFERENCE_IRRADIANCE = 0.6;

// The direction the synthesized presets aim their lobe at.
export const KEY_DIRECTION = [-3, 4, 6] as const;

// The synthesized presets are analytic rather than photographic: one broad
// radiance lobe on a neutral surround, with no lamp grid or emitter outlines for
// PMREM to integrate. `intensity` is their exposure trim.
export const SYNTHETIC_ENVIRONMENT = {
	matte: {
		label: "柔光 · 哑光",
		fill: 0.62,
		peak: 1.8,
		width: 0.22,
		elongated: false,
		intensity: 0.8,
	},
	glossy: {
		label: "聚光 · 亮面",
		fill: 0.62,
		peak: 33,
		width: 0.012,
		elongated: true,
		intensity: 0.8,
	},
} as const;

// Exposure trim of the bundled panoramas, applied on top of the normalisation
// each capture computes from its own irradiance at load.
export const PHOTOGRAPHIC_INTENSITY = {
	studioSmall09: 1.4,
	studioSmall03: 0.8,
	photoStudio01: 1,
	artistWorkshop: 1,
} as const;
