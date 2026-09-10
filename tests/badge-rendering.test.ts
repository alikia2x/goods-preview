import { describe, expect, test } from "bun:test";
import * as THREE from "three";
import { ContactShadow } from "../src/lib/badge/contact-shadow";
import {
	FINISHES,
	finishMaterial,
	KEY_DIRECTION,
} from "../src/lib/badge/finishes";
import { squareCrop } from "../src/lib/badge/framing";
import {
	lightAnglesFromPoint,
	lightDirection,
	lightRotation,
	ORIGINAL_LIGHT_ANGLES,
} from "../src/lib/badge/lighting";
import { BadgeRenderer, badgeGeometry } from "../src/lib/badge/renderer";
import { SCENES, type SceneKind } from "../src/lib/badge/scenes";
import { SceneStage } from "../src/lib/badge/stage";
import { exportDimensions } from "../src/lib/badge/studio";

describe("finish versions", () => {
	test("concentrates glossy reflection without multiplying total source energy", () => {
		const integrated = (peak: number, width: number) =>
			2 * Math.PI * peak * width * (1 - Math.exp(-2 / width));
		const matte = FINISHES.matte,
			glossy = FINISHES.glossy;
		expect(
			integrated(glossy.environmentPeak, glossy.environmentWidth) /
				integrated(matte.environmentPeak, matte.environmentWidth),
		).toBeCloseTo(1, 3);
		expect(finishMaterial("glossy", 85).clearcoatRoughness).toBeLessThan(
			finishMaterial("matte", 85).clearcoatRoughness as number,
		);
	});
});

test("shadow pass contains only the actual badge, with a receiver beneath it", () => {
	const group = new THREE.Group();
	const mesh = new THREE.Mesh(
		badgeGeometry(),
		new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
	);
	group.add(mesh);
	const shadow = new ContactShadow(group);
	try {
		expect(shadow.scene.children).toEqual([shadow.caster]);
		expect(shadow.scene.children).not.toContain(shadow.plane);
		const direction = new THREE.Vector3(...KEY_DIRECTION).normalize();
		for (const scale of [32 / 65, 1, 75 / 65]) {
			shadow.update(scale);
			shadow.caster.updateMatrixWorld(true);
			const receiver = new THREE.Vector3(0, 0, shadow.plane.position.z);
			const ray = new THREE.Raycaster(receiver, direction);
			expect(ray.intersectObject(shadow.caster, true).length).toBeGreaterThan(
				0,
			);
			ray.set(new THREE.Vector3(1.8, 1.8, receiver.z), direction);
			expect(ray.intersectObject(shadow.caster, true).length).toBe(0);
			expect(shadow.plane.position.z).toBeLessThan(-0.168 * scale);
		}
	} finally {
		shadow.dispose();
		shadow.plane.geometry.dispose();
		shadow.wall.geometry.dispose();
		shadow.material.dispose();
		mesh.geometry.dispose();
		mesh.material.dispose();
	}
});

test("gloss control changes both intensity and definition over its full range", () => {
	for (const finish of ["matte", "glossy"] as const) {
		const low = finishMaterial(finish, 0),
			middle = finishMaterial(finish, 50),
			high = finishMaterial(finish, 100);
		expect(low.clearcoat).toBe(0);
		expect(middle.clearcoat).toBeGreaterThan(0);
		expect(high.clearcoat).toBe(1);
		expect(high.clearcoatRoughness as number).toBeLessThan(
			middle.clearcoatRoughness as number,
		);
		expect(middle.clearcoatRoughness as number).toBeLessThan(
			low.clearcoatRoughness as number,
		);
	}
});

test("reflection and shadow use the same direction, including angular limits", () => {
	const group = new THREE.Group(),
		shadow = new ContactShadow(group);
	const base = new THREE.Vector3(...KEY_DIRECTION).normalize();
	try {
		const original = lightDirection(
			ORIGINAL_LIGHT_ANGLES.azimuth,
			ORIGINAL_LIGHT_ANGLES.elevation,
		);
		expect(original.distanceTo(base)).toBeLessThan(1e-12);
		for (const azimuth of [-180, -90, 0, 90, 180])
			for (const elevation of [15, 50, 90]) {
				const direction = lightDirection(azimuth, elevation);
				expect(direction.length()).toBeCloseTo(1, 10);
				expect(
					base
						.clone()
						.applyQuaternion(lightRotation(direction))
						.distanceTo(direction),
				).toBeLessThan(1e-10);
				shadow.update(1, direction);
				expect(
					shadow.camera.position.clone().normalize().distanceTo(direction),
				).toBeLessThan(1e-10);
				const expected = new THREE.Matrix4().multiplyMatrices(
					shadow.camera.projectionMatrix,
					shadow.camera.matrixWorldInverse,
				);
				expect(
					shadow.material.uniforms.shadowMatrix.value.equals(expected),
				).toBe(true);
			}
	} finally {
		shadow.dispose();
		shadow.plane.geometry.dispose();
		shadow.wall.geometry.dispose();
		shadow.material.dispose();
	}
});

test("direction pad clamps outside drags and round-trips the display direction", () => {
	for (const a of [-150, -40, 0, 90, 170])
		for (const e of [15, 40, 74, 90]) {
			const d = lightDirection(a, e),
				angles = lightAnglesFromPoint(d.x, -d.y, a);
			expect(angles.azimuth).toBeCloseTo(a, 8);
			expect(angles.elevation).toBeCloseTo(e, 8);
		}
	expect(lightAnglesFromPoint(10, -10, 0).elevation).toBeCloseTo(15, 8);
	expect(lightAnglesFromPoint(0, 0, 37)).toEqual({
		azimuth: 37,
		elevation: 90,
	});
});

test("capture is a centered square on desktop and mobile", () => {
	for (const [width, height] of [
		[1280, 900],
		[390, 438],
		[844, 203],
	]) {
		const bounds = { left: 0, top: 0, width, height },
			crop = squareCrop(bounds);
		expect(crop.width).toBe(crop.height);
		expect(crop.left + crop.width / 2).toBe(width / 2);
		expect(crop.top + crop.height / 2).toBe(height / 2);
		for (const edge of [1024, 2048, 4096])
			expect(exportDimensions(edge)).toEqual({ width: edge, height: edge });
	}
});

test("modeled scenes use clean surfaces and standing badges meet their floor", () => {
	const stage = new SceneStage(),
		group = new THREE.Group();
	const geometry = badgeGeometry(),
		material = new THREE.MeshBasicMaterial();
	group.add(new THREE.Mesh(geometry, material));
	try {
		for (const scene of Object.keys(SCENES) as SceneKind[])
			for (const scale of [32 / 65, 1, 75 / 65]) {
				stage.configure(scene, scale);
				stage.pose(group, scene, scale);
				group.updateMatrixWorld(true);
				if (SCENES[scene].standing)
					expect(new THREE.Box3().setFromObject(group).min.y).toBeCloseTo(
						-scale,
						8,
					);
				if (scene === "plain" || scene === "transparent")
					expect(stage.group.children.length).toBe(0);
				else expect(stage.group.children.length).toBeGreaterThan(0);
				stage.group.traverse((object) => {
					if (object instanceof THREE.Mesh) {
						for (const stageMaterial of Array.isArray(object.material)
							? object.material
							: [object.material]) {
							expect(stageMaterial.map).toBeNull();
							expect(stageMaterial.bumpMap).toBeNull();
						}
					}
				});
				if (scene === "studio")
					expect(
						stage.group.children.some((object) => object.rotation.x !== 0),
					).toBe(false);
				if (scene === "table" || scene === "standing") {
					stage.group.updateMatrixWorld(true);
					const ray = new THREE.Raycaster(
						new THREE.Vector3(0, 0, 0),
						new THREE.Vector3(0, -1, 0),
					);
					const hit = ray.intersectObject(stage.group, true)[0];
					expect(hit.point.y).toBeCloseTo(-scale - 0.004, 8);
				}
				if (scene === "studio") {
					stage.group.updateMatrixWorld(true);
					for (const y of [-12, -4, 0, 12]) {
						const ray = new THREE.Raycaster(
							new THREE.Vector3(0, y, 5),
							new THREE.Vector3(0, 0, -1),
						);
						expect(
							ray.intersectObject(stage.group, true).length,
						).toBeGreaterThan(0);
					}
				}
				expect(stage.casters.children.length > 0).toBe(scene === "studio");
			}
	} finally {
		stage.dispose();
		geometry.dispose();
		material.dispose();
	}
});

test("transparent export keeps the model shadow and restores preview even on failure", async () => {
	let alpha = 1,
		ratio = 2,
		resized = false;
	const scene = new THREE.Scene();
	const background = new THREE.Color("#e9e9e7");
	scene.background = background;
	const plane = new THREE.Group(),
		wall = new THREE.Group(),
		stage = new THREE.Group();
	const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
	const instance = {
		scene,
		camera,
		sceneKind: "transparent",
		host: { clientWidth: 1000, clientHeight: 800 },
		framing: {
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				width: 640,
				height: 800,
			}),
		},
		shadow: { plane, wall, render: () => {} },
		stage: { group: stage },
		resize: () => {
			resized = true;
		},
		renderer: {
			getPixelRatio: () => ratio,
			setPixelRatio: (v: number) => {
				ratio = v;
			},
			getClearAlpha: () => alpha,
			setClearAlpha: (v: number) => {
				alpha = v;
			},
			setSize: (w: number, h: number) => {
				expect(w).toBe(2048);
				expect(h).toBe(2048);
			},
			render: () => {
				expect(scene.background).toBeNull();
				expect(alpha).toBe(0);
				expect(plane.visible).toBe(true);
				expect(wall.visible || stage.visible).toBe(false);
				throw new Error("render failed");
			},
		},
	} as unknown as BadgeRenderer;
	await expect(
		BadgeRenderer.prototype.export.call(instance, 2048),
	).rejects.toThrow("render failed");
	expect(scene.background).toBe(background);
	expect(alpha).toBe(1);
	expect(ratio).toBe(2);
	expect(resized).toBe(true);
	expect(plane.visible && wall.visible && stage.visible).toBe(true);
});
