import { expect, test } from "bun:test";
import * as THREE from "three";
import {
	BADGE_TEXTURE_EDGE,
	badgeArtworkScale,
} from "../src/features/badge/model/artwork";
import { badgeGeometry } from "../src/features/badge/model/badgeGeometry";
import { DEFAULT_SETTINGS } from "../src/features/badge/constants";
import { DEFAULT_KEYCHAIN_SETTINGS } from "../src/features/keychain/settings";
import { lightEnergy } from "../src/features/studio/lib/lighting-presets";
import { SCENE_KINDS } from "../src/features/studio/lib/scenes";
import { poseProductGroup } from "../src/features/studio/lib/stage";
import { DEFAULT_STUDIO_SETTINGS } from "../src/features/studio/settings";

test("badge geometry is closed, finite and built from unit normals", () => {
	const geometry = badgeGeometry();
	try {
		const position = geometry.getAttribute("position");
		const normal = geometry.getAttribute("normal");
		const uv = geometry.getAttribute("uv");
		const index = geometry.getIndex();
		if (!index) throw new Error("badge geometry lost its index");

		expect(position.count).toBe(normal.count);
		expect(position.count).toBe(uv.count);
		expect(index.count % 3).toBe(0);

		const values = Array.from(position.array);
		expect(values.every(Number.isFinite)).toBe(true);
		expect(
			Array.from(normal.array).every((value) => Number.isFinite(value)),
		).toBe(true);

		geometry.computeBoundingBox();
		const bounds = geometry.boundingBox;
		if (!bounds) throw new Error("badge geometry has no bounds");
		// The face is a unit-radius disc that curves back into its lip.
		expect(bounds.max.x).toBeCloseTo(1, 2);
		expect(bounds.min.x).toBeCloseTo(-1, 2);
		expect(bounds.max.y).toBeCloseTo(1, 2);
		expect(bounds.min.y).toBeCloseTo(-1, 2);
		expect(bounds.max.z).toBeCloseTo(0.11, 2);

		for (let i = 0; i < normal.count; i++) {
			const length = Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i));
			expect(length).toBeCloseTo(1, 5);
		}
	} finally {
		geometry.dispose();
	}
});

test("badge artwork scaling covers the texture and grows with bleed", () => {
	const edge = BADGE_TEXTURE_EDGE;
	// A square source fills the texture exactly at zero bleed.
	expect(badgeArtworkScale(edge, edge, 65, 0)).toBeCloseTo(1, 10);
	// A half-size source is enlarged to cover.
	expect(badgeArtworkScale(edge / 2, edge / 2, 65, 0)).toBeCloseTo(2, 10);
	// Non-square sources take the larger axis so nothing is left uncovered.
	expect(badgeArtworkScale(edge / 4, edge / 2, 65, 0)).toBeCloseTo(4, 10);
	// Bleed extends past the finished diameter on both sides.
	expect(badgeArtworkScale(edge, edge, 65, 6.5)).toBeCloseTo(1.2, 10);
});

test("both products share the studio settings contract and its rules", () => {
	// Defaults must stay inside the shared base, so the shared controls apply.
	for (const defaults of [DEFAULT_SETTINGS, DEFAULT_KEYCHAIN_SETTINGS]) {
		for (const key of Object.keys(DEFAULT_STUDIO_SETTINGS)) {
			expect(key in defaults).toBe(true);
		}
	}
	expect(DEFAULT_SETTINGS.size).toBe(65);
	expect(DEFAULT_KEYCHAIN_SETTINGS.size).toBe(60);
	// A hidden scene must never be a product default, or the picker contradicts it.
	expect(DEFAULT_SETTINGS.scene).not.toBe("studio");
	expect(DEFAULT_KEYCHAIN_SETTINGS.scene).not.toBe("studio");
});

test("light energy is one shared rule for every scene", () => {
	const preset = "glossy" as const;
	// 50% is the neutral studio setup.
	expect(lightEnergy(preset, 50)).toBeCloseTo(1, 10);
	// The black scene is damped by the same factor everywhere.
	expect(lightEnergy(preset, 50, "black")).toBeCloseTo(
		lightEnergy(preset, 50) / 1.4,
		10,
	);
	expect(lightEnergy(preset, 50, "table")).toBeCloseTo(
		lightEnergy(preset, 50),
		10,
	);
	// Doubling the slider is exponential, not linear.
	expect(lightEnergy(preset, 100)).toBeCloseTo(2, 10);
	expect(lightEnergy(preset, 0)).toBeCloseTo(0.5, 10);
	// Every scene the picker can offer participates in the rule.
	for (const scene of SCENE_KINDS)
		expect(Number.isFinite(lightEnergy(preset, 72, scene))).toBe(true);
});

test("the shared pose seats standing products on the floor and leaves flat ones alone", () => {
	const geometry = new THREE.BoxGeometry(2, 0.2, 2);
	const material = new THREE.MeshBasicMaterial();
	const group = new THREE.Group();
	group.add(new THREE.Mesh(geometry, material));
	try {
		// "plain" is the flat scene; every other scene stands the product up.
		poseProductGroup(group, "plain", 1);
		expect(group.position.toArray()).toEqual([0, 0, 0]);
		expect([group.rotation.x, group.rotation.y, group.rotation.z]).toEqual([
			0, 0, 0,
		]);
		expect(group.scale.x).toBe(1);

		poseProductGroup(group, "standing", 1);
		expect(group.rotation.x).toBeCloseTo(-0.09, 10);
		// The tilted box is dropped so its lowest point sits at -scale.
		const bounds = new THREE.Box3().setFromObject(group);
		expect(bounds.min.y).toBeCloseTo(-1, 6);

		// Scale is part of the same rule.
		poseProductGroup(group, "standing", 2);
		expect(group.scale.x).toBe(2);
	} finally {
		geometry.dispose();
		material.dispose();
	}
});
