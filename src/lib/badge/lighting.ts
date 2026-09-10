import { MathUtils, Quaternion, Vector3 } from "three";
import { KEY_DIRECTION } from "./finishes";

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
export function lightRotation(direction: Vector3) {
	return new Quaternion().setFromUnitVectors(base, direction);
}

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
