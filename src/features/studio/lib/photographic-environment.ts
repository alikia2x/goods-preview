import * as THREE from "three";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { sampleEnvironment } from "@/features/studio/lib/environment-sampling";

export const PHOTOGRAPHIC_ENVIRONMENTS = {
	hdr: {
		label: "实景 · 摄影棚",
		file: "studio_small_09_512.exr",
		keyDirection: new THREE.Vector3(),
		intensity: 1.05,
		gain: 1.3,
	},
	studioContrast: {
		label: "实景 · 明暗影棚",
		file: "studio_small_03_1k.exr",
		keyDirection: new THREE.Vector3(),
		intensity: 1,
		gain: 1,
	},
	studioSoft: {
		label: "实景 · 柔光影棚",
		file: "photo_studio_01_512.exr",
		keyDirection: new THREE.Vector3(),
		intensity: 1,
		gain: 1,
	},
} satisfies Record<
	string,
	{
		label: string;
		file: string;
		keyDirection: THREE.Vector3;
		intensity: number;
		gain: number;
	}
>;
export type PhotographicPreset = keyof typeof PHOTOGRAPHIC_ENVIRONMENTS;
export function isPhotographicPreset(
	value: string,
): value is PhotographicPreset {
	return value in PHOTOGRAPHIC_ENVIRONMENTS;
}
export const PHOTOGRAPHIC_STUDIO = PHOTOGRAPHIC_ENVIRONMENTS.hdr;
const sources = new Map<PhotographicPreset, Promise<THREE.DataTexture>>();
const pmremCache = new WeakMap<
	THREE.WebGLRenderer,
	Map<PhotographicPreset, Promise<THREE.WebGLRenderTarget>>
>();

export function loadPhotographicEnvironment(
	preset: PhotographicPreset = "hdr",
) {
	let pending = sources.get(preset);
	if (!pending) {
		pending = new EXRLoader()
			.setDataType(THREE.HalfFloatType)
			.loadAsync(
				`${import.meta.env.BASE_URL}environments/${PHOTOGRAPHIC_ENVIRONMENTS[preset].file}`,
			)
			.then((source) => {
				source.flipY = false;
				source.mapping = THREE.EquirectangularReflectionMapping;
				const samples = sampleEnvironment(source);
				const main = samples[0];
				if (!main) {
					source.dispose();
					throw new Error("光照贴图没有有效采样。");
				}
				PHOTOGRAPHIC_ENVIRONMENTS[preset].keyDirection.copy(main.direction);
				// Normalize integrated emitter energy across captures, keeping their
				// contrast and chromaticity. A white Lambert surface has BRDF 1/pi.
				PHOTOGRAPHIC_ENVIRONMENTS[preset].gain =
					Math.PI / samples.reduce((total, sample) => total + sample.energy, 0);
				return source;
			})
			.catch((error) => {
				sources.delete(preset);
				throw error;
			});
		sources.set(preset, pending);
	}
	return pending;
}
export function preparePhotographicStudio(
	renderer: THREE.WebGLRenderer,
	preset: PhotographicPreset = "hdr",
) {
	let cache = pmremCache.get(renderer);
	if (!cache) {
		cache = new Map();
		pmremCache.set(renderer, cache);
	}
	let pending = cache.get(preset);
	if (!pending) {
		pending = loadPhotographicEnvironment(preset)
			.then((source) => {
				const generator = new THREE.PMREMGenerator(renderer);
				try {
					return generator.fromEquirectangular(source);
				} finally {
					generator.dispose();
				}
			})
			.catch((error) => {
				cache.delete(preset);
				throw error;
			});
		cache.set(preset, pending);
	}
	return pending;
}
