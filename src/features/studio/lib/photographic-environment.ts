import * as THREE from "three";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import {
	environmentIrradiance,
	sampleEnvironment,
} from "@/features/studio/lib/environment-sampling";
import {
	PHOTOGRAPHIC_INTENSITY,
	REFERENCE_IRRADIANCE,
	RIG_RATIO,
} from "@/tuning";

// The normal the presets are exposed for: the product faces the camera, so a
// surface turned towards +Z is what the framing shows most of.
const REFERENCE_NORMAL = new THREE.Vector3(0, 0, 1);

export const PHOTOGRAPHIC_ENVIRONMENTS = {
	studioSmall09: {
		label: "实景 · 摄影棚",
		file: "studio_small_09_512.exr",
		keyDirection: new THREE.Vector3(),
		intensity: PHOTOGRAPHIC_INTENSITY.studioSmall09,
		gain: 1,
		rigGain: 1,
	},
	studioSmall03: {
		label: "实景 · 蓝调影棚",
		file: "studio_small_03_512.exr",
		keyDirection: new THREE.Vector3(),
		intensity: PHOTOGRAPHIC_INTENSITY.studioSmall03,
		gain: 1,
		rigGain: 1,
	},
	photoStudio01: {
		label: "实景 · 明亮工作室",
		file: "photo_studio_01_512.exr",
		keyDirection: new THREE.Vector3(),
		intensity: PHOTOGRAPHIC_INTENSITY.photoStudio01,
		gain: 1,
		rigGain: 1,
	},
	artistWorkshop: {
		label: "实景 · 画室窗边",
		file: "artist_workshop_512.exr",
		keyDirection: new THREE.Vector3(),
		intensity: PHOTOGRAPHIC_INTENSITY.artistWorkshop,
		gain: 1,
		rigGain: 1,
	},
} satisfies Record<
	string,
	{
		label: string;
		file: string;
		keyDirection: THREE.Vector3;
		intensity: number;
		// Measured at load: exposure from the environment's irradiance, level for
		// the sampled emitters, and the pre-calibration normalisation.
		gain: number;
		rigGain: number;
	}
>;
export type PhotographicPreset = keyof typeof PHOTOGRAPHIC_ENVIRONMENTS;
export function isPhotographicPreset(
	value: string,
): value is PhotographicPreset {
	return value in PHOTOGRAPHIC_ENVIRONMENTS;
}
export const PHOTOGRAPHIC_STUDIO = PHOTOGRAPHIC_ENVIRONMENTS.studioSmall09;
const sources = new Map<PhotographicPreset, Promise<THREE.DataTexture>>();
const pmremCache = new WeakMap<
	THREE.WebGLRenderer,
	Map<PhotographicPreset, Promise<THREE.WebGLRenderTarget>>
>();

export function loadPhotographicEnvironment(
	preset: PhotographicPreset = "studioSmall09",
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
				const entry = PHOTOGRAPHIC_ENVIRONMENTS[preset];
				const irradiance = environmentIrradiance(source, REFERENCE_NORMAL);
				if (irradiance <= 0) {
					source.dispose();
					throw new Error("光照贴图没有有效辐照度。");
				}
				// Expose every capture by what a surface actually receives, not by how
				// concentrated its emitters are. A white Lambert surface has BRDF 1/pi.
				entry.gain = (REFERENCE_IRRADIANCE * Math.PI) / irradiance;
				// The emitters take their share of that budget, so a contrasty capture
				// keeps its direction and colour without also changing the exposure.
				const response = samples.reduce(
					(total, sample) =>
						total +
						sample.energy * Math.max(0, REFERENCE_NORMAL.dot(sample.direction)),
					0,
				);
				entry.rigGain = response > 0 ? (RIG_RATIO * irradiance) / response : 0;
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
	preset: PhotographicPreset = "studioSmall09",
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
