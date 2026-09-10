import * as THREE from "three";
import { KEY_DIRECTION } from "./lighting";

export type EnvironmentProfile = {
	fill: number;
	peak: number;
	width: number;
	elongated: boolean;
};

// Lighting only: this texture is never assigned to scene.background.
// A neutral surround plus one broad radiance lobe has no lamp grid or hard
// emitter outlines. PMREM integrates it against the material's roughness.
export function createStudioEnvironment(
	renderer: THREE.WebGLRenderer,
	preset: EnvironmentProfile,
) {
	const width = preset.elongated ? 1024 : 512,
		height = width / 2;
	const data = new Float32Array(width * height * 4);
	const direction = new THREE.Vector3();
	const key = new THREE.Vector3(...KEY_DIRECTION).normalize();
	const right = new THREE.Vector3()
		.crossVectors(key, new THREE.Vector3(0, 1, 0))
		.normalize();
	const up = new THREE.Vector3().crossVectors(right, key).normalize();
	for (let y = 0; y < height; y++) {
		const theta = ((y + 0.5) / height) * Math.PI;
		for (let x = 0; x < width; x++) {
			const phi = ((x + 0.5) / width) * Math.PI * 2;
			direction.set(
				-Math.sin(theta) * Math.cos(phi),
				-Math.cos(theta),
				-Math.sin(theta) * Math.sin(phi),
			);
			const facing = direction.dot(key);
			// The reference film reflects an elongated softbox, not a uniform white veil.
			const u = Math.atan2(direction.dot(right), facing);
			const v = Math.atan2(direction.dot(up), facing);
			const lobe = preset.elongated
				? Math.exp(-0.5 * ((u / 0.2) ** 2 + (v / 0.06) ** 2))
				: Math.exp((facing - 1) / preset.width);
			const radiance = preset.fill + preset.peak * lobe;
			const i = (y * width + x) * 4;
			data[i] = data[i + 1] = data[i + 2] = radiance;
			data[i + 3] = 1;
		}
	}
	const texture = new THREE.DataTexture(
		data,
		width,
		height,
		THREE.RGBAFormat,
		THREE.FloatType,
	);
	texture.mapping = THREE.EquirectangularReflectionMapping;
	texture.needsUpdate = true;
	const generator = new THREE.PMREMGenerator(renderer);
	const target = generator.fromEquirectangular(texture);
	generator.dispose();
	texture.dispose();
	return target;
}
