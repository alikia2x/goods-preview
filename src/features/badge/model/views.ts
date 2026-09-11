import type {
	StudioViews,
	ViewPose,
} from "@/features/studio/components/StudioViewport";
import { SCENES, type SceneKind } from "@/features/studio/lib/scenes";

const ORIGIN: [number, number, number] = [0, 0, 0];

export const BADGE_MIN_DISTANCE = 2;
export const BADGE_MAX_DISTANCE = 9;

export function badgeViews(standing: boolean): StudioViews {
	return {
		front: { position: [0, 0, 4.9], target: ORIGIN },
		back: { position: [0, 0, -4.9], target: ORIGIN },
		angle: {
			position: standing ? [0.3, 0.5, 4.9] : [0.3, -1.15, 4.7],
			target: ORIGIN,
		},
	};
}

// Each scene seats the badge differently, so the opening camera follows it.
export function badgePose(scene: SceneKind): ViewPose {
	const position: [number, number, number] =
		scene === "table"
			? [0.12, 0.4, 5.2]
			: SCENES[scene].standing
				? [0.2, 0.55, 4.9]
				: [0.35, 0.55, 4.9];
	return { position, target: ORIGIN };
}
