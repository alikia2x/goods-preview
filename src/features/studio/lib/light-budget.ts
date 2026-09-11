import type { SceneKind } from "@/features/studio/lib/scenes";

// A product is lit by two passes of the same capture: the environment map the
// material reflects, and the emitters sampled out of it for the key light. Left
// alone they light the product twice and leave its shadow illuminated from every
// direction, so the two passes share one budget instead.
//
// The environment is what fills the product evenly, including the faces the
// emitters cannot reach; the emitters are what give it direction and cast its
// shadows. Weighting the environment too lightly is what makes a product read
// dark and flat from behind, so the ambient keeps the larger share.
export const AMBIENT_IBL_SHARE = 0.6;
export const RIG_RATIO = 1 - AMBIENT_IBL_SHARE;

// Products resolved 20% of the environment diffusely before the two passes were
// balanced. The black scene, and the set surfaces tuned alongside it, keep that
// split.
export const LEGACY_AMBIENT_IBL_SHARE = 0.2;

export function ambientIblShare(scene: SceneKind) {
	return scene === "black" ? LEGACY_AMBIENT_IBL_SHARE : AMBIENT_IBL_SHARE;
}
