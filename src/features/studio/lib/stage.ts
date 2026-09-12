import * as THREE from "three";
import type { Reflector } from "three/addons/objects/Reflector.js";
import { neutralFloor } from "@/features/studio/lib/floor-material";
import { createReflectionFloor } from "@/features/studio/lib/reflection-floor";
import {
	SCENES,
	STAGE_FLOOR_Y,
	STAGE_REFLECTION_OFFSET,
	STAGE_SURFACE_OFFSET,
	type SceneKind,
	sceneWallBackground,
	sceneWallZ,
} from "@/tuning";

// A neutral scene renders its floor and wall as shadow catchers rather than lit
// surfaces: the output is the declared background colour carrying the shadow
// mask. No environment preset or light level can tint or brighten the set, and
// the backdrop matches the page colour exactly.
function createBackdrop(background: THREE.Color) {
	const material = new THREE.ShadowMaterial({
		color: background,
		transparent: false,
		toneMapped: false,
	});
	material.onBeforeCompile = neutralFloor;
	material.customProgramCacheKey = () => "studio-backdrop-v1";
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material);
	mesh.receiveShadow = true;
	return mesh;
}

// Framework-independent set geometry; each renderer owns its lighting and shadows.
export class SceneStage {
	readonly group = new THREE.Group();
	readonly casters = new THREE.Group();
	background: THREE.Color | null = null;
	private key = "";
	private reflector: Reflector | null = null;
	configure(kind: SceneKind) {
		if (kind === this.key) return false;
		this.dispose();
		this.key = kind;
		this.background = new THREE.Color(SCENES[kind].background);
		if (kind === "black") {
			const material = new THREE.MeshStandardMaterial({
				color: "#08090b",
				roughness: 0.94,
				metalness: 0,
				envMapIntensity: 1,
			});
			const top = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material);
			top.receiveShadow = true;
			top.rotation.x = -Math.PI / 2;
			top.position.y = STAGE_FLOOR_Y - STAGE_SURFACE_OFFSET;
			this.group.add(top);
			this.reflector = createReflectionFloor(
				STAGE_FLOOR_Y - STAGE_REFLECTION_OFFSET,
			);
			this.group.add(this.reflector);
			return true;
		}
		if (kind === "studio") {
			const material = new THREE.MeshStandardMaterial({
				color: "#ffffff",
				roughness: 0.94,
				metalness: 0,
				envMapIntensity: 1,
			});
			const wallZ = sceneWallZ(kind) ?? 0;
			const wall = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material);
			wall.receiveShadow = true;
			wall.position.set(0, 0, wallZ);
			this.group.add(wall);
			// Depth-only window mullions project onto the bright wall. The bars stay
			// outside the product area; only their light shape is visible.
			const frameMaterial = new THREE.MeshBasicMaterial();
			for (const x of [-2.75, -1.15, 0.45]) {
				const bar = new THREE.Mesh(
					new THREE.BoxGeometry(0.085, 5.8, 0.08),
					frameMaterial,
				);
				bar.position.set(x, 1.25, 0.9);
				this.casters.add(bar);
			}
			for (const y of [0.25, 2.2]) {
				const bar = new THREE.Mesh(
					new THREE.BoxGeometry(5.5, 0.1, 0.08),
					frameMaterial,
				);
				bar.position.set(-1.15, y, 0.9);
				this.casters.add(bar);
			}
			return true;
		}
		const floor = createBackdrop(this.background);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = STAGE_FLOOR_Y - STAGE_SURFACE_OFFSET;
		this.group.add(floor);
		const wallZ = sceneWallZ(kind);
		if (wallZ !== null) {
			const wall = createBackdrop(
				new THREE.Color(sceneWallBackground(kind) ?? SCENES[kind].background),
			);
			wall.position.z = wallZ;
			this.group.add(wall);
		}
		return true;
	}
	dispose() {
		if (this.reflector) {
			this.group.remove(this.reflector);
			this.reflector.geometry.dispose();
			this.reflector.dispose();
			this.reflector = null;
		}
		const materials = new Set<THREE.Material>();
		for (const root of [this.group, this.casters])
			root.traverse((object) => {
				if (object instanceof THREE.Mesh) {
					object.geometry.dispose();
					for (const material of Array.isArray(object.material)
						? object.material
						: [object.material]) {
						materials.add(material);
					}
				}
			});
		for (const material of materials) material.dispose();
		this.group.clear();
		this.casters.clear();
	}
}
