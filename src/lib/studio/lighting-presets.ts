import { Vector3, type WebGLRenderer, type WebGLRenderTarget } from "three";
import { createStudioEnvironment } from "./environment";
import { KEY_DIRECTION } from "./lighting";
import {
	PHOTOGRAPHIC_STUDIO,
	preparePhotographicStudio,
} from "./photographic-environment";

// Lighting presets are environment maps, independent of surface finish.
// Any product can offer the same three choices; matte and glossy keep the
// badge's original tuned lobes while "hdr" uses the bundled studio panorama.
// keyDirection records each preset's main emitter so the caller can align the
// user's chosen light direction against the correct reference.
export const LIGHTING_PRESETS = {
	matte: {
		label: "柔光 · 哑光",
		keyDirection: new Vector3(...KEY_DIRECTION).normalize(),
		intensity: 1.4,
		gain: 1,
	},
	glossy: {
		label: "聚光 · 亮面",
		keyDirection: new Vector3(...KEY_DIRECTION).normalize(),
		intensity: 1.4,
		gain: 1,
	},
	hdr: {
		label: "实景 · 摄影棚",
		keyDirection: PHOTOGRAPHIC_STUDIO.keyDirection,
		intensity: PHOTOGRAPHIC_STUDIO.intensity,
		gain: PHOTOGRAPHIC_STUDIO.gain,
	},
} as const;
export type LightingPreset = keyof typeof LIGHTING_PRESETS;

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
		pending =
			preset === "hdr"
				? preparePhotographicStudio(renderer)
				: Promise.resolve(
						createStudioEnvironment(renderer, {
							fill: 0.62,
							peak: preset === "matte" ? 1.8 : 33,
							width: preset === "matte" ? 0.22 : 0.012,
							elongated: preset === "glossy",
						}),
					);
		perRenderer.set(preset, pending);
	}
	return pending;
}
