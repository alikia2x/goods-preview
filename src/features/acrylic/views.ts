import type {
	StudioViews,
	ViewPose,
} from "@/features/studio/components/StudioViewport";
import { ACRYLIC_CAMERA, type Vector3Tuple } from "@/tuning";

export const ACRYLIC_MIN_DISTANCE = ACRYLIC_CAMERA.minDistance;
export const ACRYLIC_MAX_DISTANCE = ACRYLIC_CAMERA.maxDistance;

// An acrylic product is framed around the outline it was cut to, so its seats are
// directions from the measured centre rather than fixed positions.
function placed(
	center: Vector3Tuple,
	distance: number,
	direction: Vector3Tuple,
): Vector3Tuple {
	const [x, y, z] = direction;
	const length = Math.hypot(x, y, z) || 1;
	return [
		center[0] + (x / length) * distance,
		center[1] + (y / length) * distance,
		center[2] + (z / length) * distance,
	];
}

export function acrylicViews(
	center: Vector3Tuple,
	distance: number,
): StudioViews {
	const { views } = ACRYLIC_CAMERA;
	return {
		front: { position: placed(center, distance, views.front), target: center },
		back: { position: placed(center, distance, views.back), target: center },
		angle: { position: placed(center, distance, views.angle), target: center },
	};
}

export function acrylicPose(
	direction: Vector3Tuple,
	center: Vector3Tuple,
	distance: number,
): ViewPose {
	return { position: placed(center, distance, direction), target: center };
}
