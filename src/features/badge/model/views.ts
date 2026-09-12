import type { BadgePose } from "@/features/badge/settings";
import type {
	StudioViews,
	ViewPose,
} from "@/features/studio/components/StudioViewport";
import { BADGE_CAMERA, type SceneKind, type Vector3Tuple } from "@/tuning";

export const BADGE_MIN_DISTANCE = BADGE_CAMERA.minDistance;
export const BADGE_MAX_DISTANCE = BADGE_CAMERA.maxDistance;

// Seats are offsets from wherever the badge ended up, so a badge resting against
// a backdrop is still framed on itself.
function seated(center: Vector3Tuple, offset: Vector3Tuple): Vector3Tuple {
	return [center[0] + offset[0], center[1] + offset[1], center[2] + offset[2]];
}

export function badgeViews(center: Vector3Tuple, pose: BadgePose): StudioViews {
	const { views, flatAngle } = BADGE_CAMERA;
	const angle = pose === "standing" ? views.angle : flatAngle;
	return {
		front: { position: seated(center, views.front), target: center },
		back: { position: seated(center, views.back), target: center },
		angle: { position: seated(center, angle), target: center },
	};
}

// Each scene and pose seats the badge differently, so the opening camera follows.
export function badgePose(
	center: Vector3Tuple,
	scene: SceneKind,
	pose: BadgePose,
): ViewPose {
	const offset =
		pose === "flat"
			? BADGE_CAMERA.flatOpening
			: scene === "table"
				? BADGE_CAMERA.tableOpening
				: BADGE_CAMERA.opening;
	return { position: seated(center, offset), target: center };
}
