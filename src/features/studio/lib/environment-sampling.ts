import * as THREE from "three";

export type EnvironmentLightSample = {
	direction: THREE.Vector3;
	color: THREE.Color;
	energy: number;
};

// Integrate radiance over equal angular cells, including the equirectangular
// solid-angle Jacobian. The strongest cell is the shadow-casting key; other
// cells provide fill only. They must not each create a separate hard shadow.
export function sampleEnvironment(
	source: THREE.DataTexture,
): EnvironmentLightSample[] {
	const { width, height, data } = source.image;
	if (!data) return [];
	const cells = Array.from({ length: 128 }, () => ({
		direction: new THREE.Vector3(),
		rgb: new THREE.Color(0, 0, 0),
		weight: 0,
	}));
	const read = (i: number) =>
		source.type === THREE.HalfFloatType
			? THREE.DataUtils.fromHalfFloat(data[i])
			: data[i];
	for (let y = 0; y < height; y += 2)
		for (let x = 0; x < width; x += 2) {
			const u = (x + 0.5) / width,
				v = source.flipY ? 1 - (y + 0.5) / height : (y + 0.5) / height;
			const theta = (1 - v) * Math.PI,
				phi = (u - 0.5) * Math.PI * 2;
			const direction = new THREE.Vector3(
				Math.sin(theta) * Math.cos(phi),
				Math.cos(theta),
				Math.sin(theta) * Math.sin(phi),
			);
			const solidAngle =
				(Math.sin(theta) * 8 * Math.PI * Math.PI) / (width * height);
			const i = (y * width + x) * 4;
			const r = read(i),
				g = read(i + 1),
				b = read(i + 2);
			const weight = (0.2126 * r + 0.7152 * g + 0.0722 * b) * solidAngle;
			if (!Number.isFinite(weight) || weight <= 0) continue;
			const cell =
				cells[
					Math.min(7, Math.floor(v * 8)) * 16 + Math.min(15, Math.floor(u * 16))
				];
			cell.direction.addScaledVector(direction, weight);
			cell.rgb.r += r * solidAngle;
			cell.rgb.g += g * solidAngle;
			cell.rgb.b += b * solidAngle;
			cell.weight += weight;
		}
	return cells
		.filter((c) => c.weight > 0)
		.sort((a, b) => b.weight - a.weight)
		.slice(0, 8)
		.map((cell) => {
			const energy = Math.max(cell.rgb.r, cell.rgb.g, cell.rgb.b);
			return {
				direction: cell.direction.normalize(),
				color: cell.rgb.multiplyScalar(1 / energy),
				energy,
			};
		});
}
