import * as THREE from "three";
import type { BadgeSettings } from "@/features/badge/settings";
import type { Frame } from "@/features/studio/lib/framing";
import { STAGE_FLOOR_Y, sceneWallZ } from "@/tuning";

// How far a standing badge leans back, and how far it is turned to the side.
const LEAN = 0.09;
const TURN = -0.04;

// Seat the badge on the set and report what it occupies, which is what the camera
// frames.
//
// Standing, the badge leans back and — where the scene has a backdrop — rests
// against that wall: a pin badge on edge has nothing else to hold it up. Its
// lowest and rearmost points are measured rather than derived, so it sits on the
// floor line and touches the wall at every size.
//
// Flat, its decorated face is turned upward and its lowest hardware point is
// measured against the same floor line, so it rests on rather than intersects
// the table at every size.
export function placeBadge(
	group: THREE.Group,
	settings: Pick<BadgeSettings, "scene" | "pose">,
	scale: number,
): Frame {
	group.position.set(0, 0, 0);
	group.rotation.set(0, 0, 0);
	group.scale.setScalar(scale);
	if (settings.pose === "flat") {
		group.rotation.x = -Math.PI / 2;
		group.updateMatrixWorld(true);
		const flat = new THREE.Box3().setFromObject(group);
		group.position.y = STAGE_FLOOR_Y - flat.min.y;
	} else {
		group.rotation.set(-LEAN, TURN, 0);
		group.updateMatrixWorld(true);
		const upright = new THREE.Box3().setFromObject(group);
		group.position.y = STAGE_FLOOR_Y - upright.min.y;
		const wallZ = sceneWallZ(settings.scene);
		if (wallZ !== null) group.position.z = wallZ - upright.min.z;
	}
	group.updateMatrixWorld(true);
	const placed = new THREE.Box3().setFromObject(group);
	return {
		center: [
			(placed.min.x + placed.max.x) / 2,
			(placed.min.y + placed.max.y) / 2,
			(placed.min.z + placed.max.z) / 2,
		],
		// The widest the badge got in any direction is what gets framed.
		span: Math.max(
			placed.max.x - placed.min.x,
			placed.max.y - placed.min.y,
			placed.max.z - placed.min.z,
		),
	};
}
