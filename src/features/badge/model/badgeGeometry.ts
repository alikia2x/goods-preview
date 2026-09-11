import * as THREE from "three";

// An oblate ellipsoid continues past its equator into the tucked-under lip.
// The analytic normals remain continuous at the pole, seam and outer shoulder.
export function badgeGeometry() {
	const positions: number[] = [],
		normals: number[] = [],
		uv: number[] = [],
		indices: number[] = [];
	const rings = 96,
		segments = 192;
	const normal = new THREE.Vector3();
	for (let r = 0; r <= rings; r++) {
		const theta = (r / rings) * 1.84;
		const radius = Math.sin(theta),
			z = -0.02 + 0.13 * Math.cos(theta);
		for (let s = 0; s <= segments; s++) {
			const a = (s / segments) * Math.PI * 2;
			const x = radius * Math.cos(a),
				y = radius * Math.sin(a);
			positions.push(x, y, z);
			normal.set(x, y, Math.cos(theta) / 0.13).normalize();
			normals.push(normal.x, normal.y, normal.z);
			uv.push(x / 2 + 0.5, y / 2 + 0.5);
			if (r < rings && s < segments) {
				const i = r * (segments + 1) + s;
				if (r > 0) indices.push(i, i + segments + 1, i + 1);
				indices.push(i + 1, i + segments + 1, i + segments + 2);
			}
		}
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3),
	);
	geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
	geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
	geometry.setIndex(indices);
	return geometry;
}
