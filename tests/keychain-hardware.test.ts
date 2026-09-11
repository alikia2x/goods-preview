import { expect, test } from "bun:test";
import * as THREE from "three";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import {
	claspBodyGeometry,
	claspGateGeometry,
	ovalLinkGeometry,
	splitRingGeometry,
} from "../src/lib/keychain/hardware";

test("spring ring has outward faces, an open center and separated windings", () => {
	const geometry = splitRingGeometry(),
		material = new THREE.MeshBasicMaterial(),
		mesh = new THREE.Mesh(geometry, material);
	try {
		mesh.updateMatrixWorld(true);
		const empty = new THREE.Raycaster(
			new THREE.Vector3(0, 0, 1),
			new THREE.Vector3(0, 0, -1),
		).intersectObject(mesh);
		expect(empty.length).toBe(0);
		const surface = new THREE.Raycaster(
			new THREE.Vector3(0.43, 0, 1),
			new THREE.Vector3(0, 0, -1),
		).intersectObject(mesh);
		expect(surface.length).toBeGreaterThanOrEqual(2);
		expect(surface[0].face?.normal.z).toBeGreaterThan(0.8);
		expect(
			surface[0].point.z - surface[surface.length - 1].point.z,
		).toBeGreaterThan(0.02);
		geometry.computeBoundingBox();
		expect(geometry.boundingBox?.max.x).toBeLessThan(0.46);
	} finally {
		geometry.dispose();
		material.dispose();
	}
});

test("cast clasp and gate have volume and preserve the functional opening", () => {
	for (const geometry of [
		claspBodyGeometry(),
		claspGateGeometry(),
		ovalLinkGeometry(),
	]) {
		const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
			mesh = new THREE.Mesh(geometry, material);
		try {
			geometry.computeBoundingBox();
			const bounds = geometry.boundingBox;
			if (!bounds) throw Error("Missing bounds");
			expect(bounds.max.z - bounds.min.z).toBeGreaterThan(0.02);
			expect(
				Array.from(geometry.getAttribute("normal").array).every(
					Number.isFinite,
				),
			).toBe(true);
			mesh.updateMatrixWorld(true);
			expect(
				new THREE.Raycaster(
					new THREE.Vector3(0, 0, 1),
					new THREE.Vector3(0, 0, -1),
				).intersectObject(mesh).length,
			).toBe(0);
		} finally {
			geometry.dispose();
			material.dispose();
		}
	}
});

test("bundled studio is the original unclipped HDR, not a tonemapped panorama", async () => {
	const bytes = await Bun.file(
		new URL("../public/environments/studio_small_09_2k.hdr", import.meta.url),
	).arrayBuffer();
	expect(new Bun.CryptoHasher("md5").update(bytes).digest("hex")).toBe(
		"b056fea247bc84b81d2e0987d44c87d8",
	);
	const hdr = new HDRLoader().setDataType(THREE.FloatType).parse(bytes);
	expect([hdr.width, hdr.height]).toEqual([2048, 1024]);
	let peak = 0;
	for (let i = 0; i < hdr.data.length; i += 4)
		peak = Math.max(peak, hdr.data[i]);
	expect(peak).toBeGreaterThan(100);
});

test("runtime studio environment is a compact half-float EXR with HDR highlights", async () => {
	const bytes = await Bun.file(
		new URL("../public/environments/studio_small_09_512.exr", import.meta.url),
	).arrayBuffer();
	expect(bytes.byteLength).toBeLessThan(600_000);

	const exr = new EXRLoader().setDataType(THREE.HalfFloatType).parse(bytes);
	expect([exr.width, exr.height]).toEqual([512, 256]);
	expect(exr.flipY).toBe(false);

	let peak = 0;
	for (let i = 0; i < exr.data.length; i += 4)
		peak = Math.max(peak, THREE.DataUtils.fromHalfFloat(exr.data[i]));
	expect(peak).toBeGreaterThan(100);
});
