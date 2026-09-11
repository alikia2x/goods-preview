import { MathUtils, Vector3 } from "three";
export const KEY_DIRECTION = [-3, 4, 6] as const;

// Azimuth: zero is above the badge, negative angles move toward its left.
// Elevation: angle above the badge's XY plane; 90 degrees is straight on.
export function lightDirection(azimuth: number, elevation: number) {
	const a = MathUtils.degToRad(azimuth),
		e = MathUtils.degToRad(elevation);
	return new Vector3(
		Math.sin(a) * Math.cos(e),
		Math.cos(a) * Math.cos(e),
		Math.sin(e),
	);
}
const base = new Vector3(...KEY_DIRECTION).normalize();
export const ORIGINAL_LIGHT_ANGLES = Object.freeze({
	azimuth: MathUtils.radToDeg(Math.atan2(base.x, base.y)),
	elevation: MathUtils.radToDeg(Math.asin(base.z)),
});
export function lightAnglesFromPoint(
	x: number,
	y: number,
	previousAzimuth: number,
) {
	const radius = Math.min(Math.cos(MathUtils.degToRad(15)), Math.hypot(x, y));
	return {
		azimuth:
			radius < 0.001 ? previousAzimuth : MathUtils.radToDeg(Math.atan2(x, -y)),
		elevation: MathUtils.radToDeg(Math.acos(radius)),
	};
}

// Fit the directional-light orthographic frustum to a volume plus its
// projection onto the floor (y=floorY) and, when present, the backdrop wall.
// The box tracks the light direction, so grazing angles stretch it instead of
// clipping shadows, and the shadow map stays focused on what can be shaded.
export function shadowFrustum(
	direction: Vector3,
	wallZ: number | null,
	min: readonly [number, number, number] = [-1.8, -1.1, -0.8],
	max: readonly [number, number, number] = [1.8, 3.9, 0.8],
	lightDistance = 10,
	floorY = -1,
) {
	const lightPos = direction.clone().multiplyScalar(lightDistance);
	const forward = direction.clone().negate();
	const upRef =
		Math.abs(forward.y) > 0.99 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
	const right = new Vector3().crossVectors(forward, upRef).normalize();
	const up = new Vector3().crossVectors(right, forward);
	const corners: Vector3[] = [];
	for (const x of [min[0], max[0]])
		for (const y of [min[1], max[1]])
			for (const z of [min[2], max[2]]) corners.push(new Vector3(x, y, z));
	const points = [...corners];
	for (const corner of corners) {
		if (direction.y > 1e-4) {
			const s = (corner.y - floorY) / direction.y;
			if (s > 0) points.push(corner.clone().addScaledVector(direction, -s));
		}
		if (wallZ !== null && Math.abs(direction.z) > 1e-4) {
			const t = (corner.z - wallZ) / direction.z;
			if (t > 0) points.push(corner.clone().addScaledVector(direction, -t));
		}
	}
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity,
		near = Infinity,
		far = -Infinity;
	const rel = new Vector3();
	for (const point of points) {
		rel.subVectors(point, lightPos);
		minX = Math.min(minX, rel.dot(right));
		maxX = Math.max(maxX, rel.dot(right));
		minY = Math.min(minY, rel.dot(up));
		maxY = Math.max(maxY, rel.dot(up));
		const depth = rel.dot(forward);
		near = Math.min(near, depth);
		far = Math.max(far, depth);
	}
	const pad = 0.5;
	return {
		left: minX - pad,
		right: maxX + pad,
		bottom: minY - pad,
		top: maxY + pad,
		near: Math.max(0.1, near - pad),
		far: far + pad,
	};
}
