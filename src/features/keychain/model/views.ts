import type {
	StudioViews,
	ViewPose,
} from "@/features/studio/components/StudioViewport";

export const KEYCHAIN_MIN_DISTANCE = 3;
export const KEYCHAIN_MAX_DISTANCE = 12;

type Vec3 = [number, number, number];

function placed(center: Vec3, distance: number, direction: Vec3): Vec3 {
	const [x, y, z] = direction;
	const length = Math.hypot(x, y, z) || 1;
	return [
		center[0] + (x / length) * distance,
		center[1] + (y / length) * distance,
		center[2] + (z / length) * distance,
	];
}

export function keychainViews(center: Vec3, distance: number): StudioViews {
	return {
		front: { position: placed(center, distance, [0, 0, 1]), target: center },
		back: {
			position: placed(center, distance, [0, 0.03, -1]),
			target: center,
		},
		angle: {
			position: placed(center, distance, [0.25, 0.1, 1]),
			target: center,
		},
	};
}

export function keychainPose(center: Vec3, distance: number): ViewPose {
	return {
		position: placed(center, distance, [0.07, 0.05, 1]),
		target: center,
	};
}
