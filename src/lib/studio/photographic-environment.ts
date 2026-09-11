import * as THREE from "three";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";

// Public constants stay unchanged; rendering consistency is verified by tests.
export const PHOTOGRAPHIC_STUDIO = {
	url: `${import.meta.env.BASE_URL}environments/studio_small_09_512.exr`,
	keyDirection: new THREE.Vector3(-0.823, 0.262, -0.504).normalize(),
	intensity: 1.05,
};

// The compressed half-float EXR fetch is global (network + parse), but PMREM
// conversion is tied to the GL context that runs it, so results cache per
// renderer.
let environmentPromise: Promise<THREE.DataTexture> | null = null;
const pmremCache = new WeakMap<
	THREE.WebGLRenderer,
	Promise<THREE.WebGLRenderTarget>
>();

function loadEnvironment() {
	if (!environmentPromise)
		environmentPromise = new EXRLoader()
			.setDataType(THREE.HalfFloatType)
			.loadAsync(PHOTOGRAPHIC_STUDIO.url)
			.then((source) => {
				// EXRLoader returns scanlines bottom-to-top; match HDRLoader's
				// equirectangular texture orientation before PMREM conversion.
				source.flipY = true;
				source.mapping = THREE.EquirectangularReflectionMapping;
				return source;
			});
	return environmentPromise;
}

export function preparePhotographicStudio(renderer: THREE.WebGLRenderer) {
	let pending = pmremCache.get(renderer);
	if (!pending) {
		pending = loadEnvironment().then((source) => {
			const generator = new THREE.PMREMGenerator(renderer);
			const target = generator.fromEquirectangular(source);
			generator.dispose();
			return target;
		});
		pmremCache.set(renderer, pending);
	}
	return pending;
}
