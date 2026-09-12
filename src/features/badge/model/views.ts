import type { BadgePose } from "@/features/badge/settings";
import type {
	StudioViews,
	ViewPose,
} from "@/features/studio/components/StudioViewport";
import { cameraSeat } from "@/features/studio/lib/framing";
import { BADGE_CAMERA, type SceneKind, type Vector3Tuple } from "@/tuning";

export const BADGE_MIN_DISTANCE = BADGE_CAMERA.minDistance;
export const BADGE_MAX_DISTANCE = BADGE_CAMERA.maxDistance;

// Seats are read from wherever the badge ended up, so a badge resting against a
// backdrop is still framed on itself.
export function badgeViews(
	center: Vector3Tuple,
	distance: number,
	pose: BadgePose,
): StudioViews {
	const views =
		pose === "standing" ? BADGE_CAMERA.views : BADGE_CAMERA.flatViews;
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

// Each scene and pose seats the badge differently, so the opening camera follows.
export function badgePose(
	center: Vector3Tuple,
	scene: SceneKind,
	pose: BadgePose,
	distance: number,
): ViewPose {
	const direction =
		pose === "flat"
			? BADGE_CAMERA.flatOpening
			: scene === "table"
				? BADGE_CAMERA.tableOpening
				: BADGE_CAMERA.opening;
	return { position: cameraSeat(center, distance, direction), target: center };
}
