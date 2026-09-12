import * as THREE from "three";
import type { BadgeSettings } from "@/features/badge/settings";
import { STAGE_FLOOR_Y, type Vector3Tuple, sceneWallZ } from "@/tuning";

// How far a standing badge leans back, and how far it is turned to the side.
const LEAN = 0.09;
const TURN = -0.04;

// Seat the badge on the set and report where its middle ended up, which is what
// the camera should look at.
//
// Standing, the badge leans back and — where the scene has a backdrop — rests
// against that wall: a pin badge on edge has nothing else to hold it up. Its
// lowest and rearmost points are measured rather than derived, so it sits on the
// floor line and touches the wall at every size.
//
// Flat, it stays where its own geometry is centred, as if the camera were
// looking down at it lying on a table.
export function placeBadge(
	group: THREE.Group,
	settings: BadgeSettings,
	scale: number,
): Vector3Tuple {
	group.position.set(0, 0, 0);
	group.rotation.set(0, 0, 0);
	group.scale.setScalar(scale);
	if (settings.pose === "standing") {
		group.rotation.set(-LEAN, TURN, 0);
		group.updateMatrixWorld(true);
		const upright = new THREE.Box3().setFromObject(group);
		group.position.y = STAGE_FLOOR_Y - upright.min.y;
		const wallZ = sceneWallZ(settings.scene);
		if (wallZ !== null) group.position.z = wallZ - upright.min.z;
	}
	group.updateMatrixWorld(true);
	const placed = new THREE.Box3().setFromObject(group);
	return [
		(placed.min.x + placed.max.x) / 2,
		(placed.min.y + placed.max.y) / 2,
		(placed.min.z + placed.max.z) / 2,
	];
}
