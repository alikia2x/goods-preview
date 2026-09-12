import type {
	StudioViews,
	ViewPose,
} from "@/features/studio/components/StudioViewport";
import { cameraSeat } from "@/features/studio/lib/framing";
import { ACRYLIC_CAMERA, type Vector3Tuple } from "@/tuning";

export const ACRYLIC_MIN_DISTANCE = ACRYLIC_CAMERA.minDistance;
export const ACRYLIC_MAX_DISTANCE = ACRYLIC_CAMERA.maxDistance;

// An acrylic product is framed around the outline it was cut to, so its seats are
// directions from the measured centre rather than fixed positions.
export function acrylicViews(
	center: Vector3Tuple,
	distance: number,
): StudioViews {
	const { views } = ACRYLIC_CAMERA;
	return {
		front: {
			position: cameraSeat(center, distance, views.front),
			target: center,
		},
		back: {
			position: cameraSeat(center, distance, views.back),
			target: center,
		},
		angle: {
			position: cameraSeat(center, distance, views.angle),
			target: center,
		},
	};
}

export function acrylicPose(
	direction: Vector3Tuple,
	center: Vector3Tuple,
	distance: number,
): ViewPose {
	return {
		position: cameraSeat(center, distance, direction),
		target: center,
	};
}
