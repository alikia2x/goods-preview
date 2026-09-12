import { Vector3, type WebGLRenderer, type WebGLRenderTarget } from "three";
import { createStudioEnvironment } from "@/features/studio/lib/environment";
import {
	PHOTOGRAPHIC_ENVIRONMENTS,
	isPhotographicPreset,
	preparePhotographicStudio,
} from "@/features/studio/lib/photographic-environment";
import { KEY_DIRECTION, SYNTHETIC_ENVIRONMENT, type SceneKind } from "@/tuning";

// Lighting presets are environment maps, independent of surface finish.
// Any product can offer the same choices; matte and glossy keep the badge's
// original tuned lobes while the photographic captures use the bundled
// panoramas. keyDirection records each preset's main emitter so the caller can
// align the user's chosen light direction against the correct reference. The
// synthetic presets are fixed, so their exposure and emitter level are neutral.
export const LIGHTING_PRESETS = {
	matte: {
		...SYNTHETIC_ENVIRONMENT.matte,
		keyDirection: new Vector3(...KEY_DIRECTION).normalize(),
		gain: 1,
		rigGain: 1,
		legacyGain: 1,
	},
	glossy: {
		...SYNTHETIC_ENVIRONMENT.glossy,
		keyDirection: new Vector3(...KEY_DIRECTION).normalize(),
		gain: 1,
		rigGain: 1,
		legacyGain: 1,
	},
	...PHOTOGRAPHIC_ENVIRONMENTS,
} as const;
export type LightingPreset = keyof typeof LIGHTING_PRESETS;
export const LIGHTING_PRESET_KEYS = Object.keys(
	LIGHTING_PRESETS,
) as LightingPreset[];

export function isLightingPreset(value: string): value is LightingPreset {
	return value in LIGHTING_PRESETS;
}

// Scale the lighting rig; 50% is the neutral studio setup. The black scene is
// left exactly as it was tuned, so it keeps the pre-calibration normalisation
// and drops the synthetic presets' lift.
function presetEnergy(
	preset: LightingPreset,
	lightPercent: number,
	scene?: SceneKind,
) {
	const entry = LIGHTING_PRESETS[preset];
	const gain = scene === "black" ? entry.legacyGain : entry.gain;
	return (
		2 ** ((lightPercent - 50) / 50) * gain * (scene === "black" ? 1 / 1.4 : 1)
	);
}

// The environment map is what a product is lit by; the sampled emitters add
// directional light on top of it.
export function environmentEnergy(
	preset: LightingPreset,
	lightPercent: number,
	scene?: SceneKind,
) {
	return presetEnergy(preset, lightPercent, scene);
}

export function lightEnergy(
	preset: LightingPreset,
	lightPercent: number,
	scene?: SceneKind,
) {
	const energy = presetEnergy(preset, lightPercent, scene);
	return scene === "black" ? energy : energy * LIGHTING_PRESETS[preset].rigGain;
}

// PMREM targets are tied to the GL context that produced them, so cache per
// renderer, not globally — the badge and keychain canvases are separate.
const cache = new WeakMap<
	WebGLRenderer,
	Map<LightingPreset, Promise<WebGLRenderTarget>>
>();

export function prepareLightingPreset(
	renderer: WebGLRenderer,
	preset: LightingPreset,
) {
	let perRenderer = cache.get(renderer);
	if (!perRenderer) {
		perRenderer = new Map();
		cache.set(renderer, perRenderer);
	}
	let pending = perRenderer.get(preset);
	if (!pending) {
		pending = isPhotographicPreset(preset)
			? preparePhotographicStudio(renderer, preset)
			: Promise.resolve(
					createStudioEnvironment(renderer, SYNTHETIC_ENVIRONMENT[preset]),
				);
		perRenderer.set(preset, pending);
	}
	return pending;
}
