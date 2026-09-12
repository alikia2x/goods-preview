import type {
	StudioViews,
	ViewPose,
} from "@/features/studio/components/StudioViewport";
import { BADGE_CAMERA, type SceneKind } from "@/tuning";

const ORIGIN: [number, number, number] = [0, 0, 0];

export const BADGE_MIN_DISTANCE = BADGE_CAMERA.minDistance;
export const BADGE_MAX_DISTANCE = BADGE_CAMERA.maxDistance;

export function badgeViews(): StudioViews {
	const { views } = BADGE_CAMERA;
	return {
		front: { position: views.front, target: ORIGIN },
		back: { position: views.back, target: ORIGIN },
		angle: { position: views.angle, target: ORIGIN },
	};
}

// Each scene seats the badge differently, so the opening camera follows it.
export function badgePose(scene: SceneKind): ViewPose {
	const position =
		scene === "table" ? BADGE_CAMERA.tableOpening : BADGE_CAMERA.opening;
	return { position, target: ORIGIN };
}
