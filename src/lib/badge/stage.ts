import * as THREE from "three";
import { SCENES, type SceneKind } from "./scenes";

export class SceneStage {
	readonly group = new THREE.Group();
	readonly casters = new THREE.Group();
	private key = "";
	configure(kind: SceneKind, scale: number) {
		const key = `${kind}:${scale}`;
		if (key === this.key) return false;
		this.dispose();
		this.key = key;
		if (kind === "plain" || kind === "transparent") return true;
		const material = new THREE.MeshStandardMaterial({
			color: kind === "table" ? "#f7f7f3" : "#fafaf7",
			roughness: kind === "table" ? 0.82 : 0.94,
			metalness: 0,
		});
		if (kind !== "studio") {
			const top = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material);
			top.rotation.x = -Math.PI / 2;
			top.position.y = -scale - 0.004;
			this.group.add(top);
		}
		{
			const wallMaterial =
				kind === "studio"
					? material
					: new THREE.MeshStandardMaterial({
							color: "#e3e5e5",
							roughness: 1,
							metalness: 0,
						});
			const wall = new THREE.Mesh(
				new THREE.PlaneGeometry(200, 200),
				wallMaterial,
			);
			wall.position.set(0, 0, kind === "studio" ? -2 : -4);
			this.group.add(wall);
			if (kind === "studio") {
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
			}
		}
		return true;
	}
	pose(group: THREE.Group, kind: SceneKind, scale: number) {
		group.position.set(0, 0, 0);
		group.rotation.set(0, 0, 0);
		group.scale.setScalar(scale);
		if (SCENES[kind].standing) {
			group.rotation.set(-0.09, -0.04, 0);
			group.updateMatrixWorld(true);
			const bounds = new THREE.Box3().setFromObject(group);
			group.position.y = -scale - bounds.min.y;
		}
	}
	dispose() {
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
