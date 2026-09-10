import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

// Public constants stay unchanged; rendering consistency is verified by tests.
export const PHOTOGRAPHIC_STUDIO = {
	url: `${import.meta.env.BASE_URL}environments/studio_small_09_2k.hdr`,
	keyDirection: new THREE.Vector3(-0.823, 0.262, -0.504).normalize(),
	intensity: 1.05,
};

// The raw HDR fetch is global (network + parse), but PMREM conversion is tied
// to the GL context that runs it, so conversion results cache per renderer.
let hdrPromise: Promise<THREE.DataTexture> | null = null;
const pmremCache = new WeakMap<
	THREE.WebGLRenderer,
	Promise<THREE.WebGLRenderTarget>
>();

function loadHdr() {
	if (!hdrPromise)
		hdrPromise = new HDRLoader()
			.loadAsync(PHOTOGRAPHIC_STUDIO.url)
			.then((source) => {
				source.mapping = THREE.EquirectangularReflectionMapping;
				return source;
			});
	return hdrPromise;
}

export function preparePhotographicStudio(renderer: THREE.WebGLRenderer) {
	let pending = pmremCache.get(renderer);
	if (!pending) {
		pending = loadHdr().then((source) => {
			const generator = new THREE.PMREMGenerator(renderer);
			const target = generator.fromEquirectangular(source);
			generator.dispose();
			return target;
		});
		pmremCache.set(renderer, pending);
	}
	return pending;
}
