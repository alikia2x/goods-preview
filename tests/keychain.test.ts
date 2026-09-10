import { expect, test } from "bun:test";
import * as THREE from "three";
import {
	type ArtworkMask,
	acrylicGeometry,
	keychainFrame,
	traceOutline,
} from "../src/lib/keychain/geometry";
import { captureSquare } from "../src/lib/studio/capture";

function maskFor(predicate: (x: number, y: number) => boolean): ArtworkMask {
	const width = 192,
		height = 192,
		alpha = new Uint8Array(width * height);
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++)
			if (predicate(x, y)) alpha[y * width + x] = 255;
	return { width, height, alpha };
}

test("acrylic extrusion retains concavities, thickness, clear interior and a through-hole", () => {
	const mask = maskFor(
		(x, y) => x > 30 && x < 160 && y > 30 && y < 165 && !(x > 90 && y > 100),
	);
	const outline = traceOutline(mask, 2 / 60),
		geometry = acrylicGeometry(outline, 0.1);
	const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
	const mesh = new THREE.Mesh(geometry, material);
	mesh.updateMatrixWorld(true);
	const hit = (x: number, y: number) =>
		new THREE.Raycaster(
			new THREE.Vector3(x, y, 1),
			new THREE.Vector3(0, 0, -1),
		).intersectObject(mesh);
	try {
		geometry.computeBoundingBox();
		const bounds = geometry.boundingBox;
		if (!bounds) throw new Error("Missing geometry bounds");
		expect(bounds.max.z - bounds.min.z).toBeCloseTo(0.1, 6);
		expect(hit(outline.hole.x, outline.hole.y).length).toBe(0);
		expect(
			hit(outline.hole.x + outline.holeRadius * 1.7, outline.hole.y).length,
		).toBeGreaterThan(0);
		expect(hit(-0.3, 0.3).length).toBeGreaterThan(0);
		expect(hit(0.5, -0.5).length).toBe(0);
		const positions = geometry.getAttribute("position");
		expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
	} finally {
		geometry.dispose();
		material.dispose();
	}
});

test("transparent islands are validated instead of silently losing artwork", () => {
	expect(() =>
		traceOutline(
			maskFor(() => false),
			0.03,
		),
	).toThrow("完全透明");
	expect(() =>
		traceOutline(
			maskFor((x, y) => y > 40 && y < 150 && (x < 40 || x > 150)),
			0.02,
		),
	).toThrow("分离");
	const outline = traceOutline(
		maskFor(() => true),
		0.03,
	);
	expect(outline.width).toBe(2);
	expect(outline.height).toBe(2);
});

test("larger bleed extends the cutline and keeps its mounting hole outside the print", () => {
	const mask = maskFor((x, y) => (x - 96) ** 2 + (y - 96) ** 2 < 70 ** 2);
	const a = traceOutline(mask, 0.02),
		b = traceOutline(mask, 0.08);
	expect(Math.min(...b.points.map((p) => p.x))).toBeLessThan(
		Math.min(...a.points.map((p) => p.x)),
	);
	expect(b.hole.y).toBeGreaterThan(a.hole.y);
});

test("framing includes both the acrylic and the entire ring at every offered size", () => {
	const outline = traceOutline(
		maskFor(() => true),
		0.04,
	);
	for (const size of [40, 60, 80]) {
		const frame = keychainFrame(outline, size, "ring");
		const scale = size / 60,
			bottom = Math.min(...outline.points.map((p) => p.y));
		const top = (outline.hole.y + 1.465) * scale - 1 - bottom * scale;
		expect(frame.center[1] + frame.span / 2).toBeGreaterThanOrEqual(
			top - 1e-10,
		);
		expect(frame.center[1] - frame.span / 2).toBeLessThanOrEqual(-1 + 1e-10);
	}
});

test("square transparent capture keeps shadows, crops framing, and restores renderer on failure", async () => {
	const scene = new THREE.Scene(),
		background = new THREE.Color("white"),
		stage = new THREE.Group(),
		shadow = new THREE.Group();
	scene.background = background;
	scene.add(stage, shadow);
	const camera = new THREE.PerspectiveCamera(35, 1000 / 800, 0.1, 100);
	camera.setViewOffset(1000, 800, 180, 0, 1000, 800);
	let alpha = 1,
		ratio = 2,
		size = new THREE.Vector2(1000, 800);
	const renderer = {
		getSize: (target: THREE.Vector2) => target.copy(size),
		getPixelRatio: () => ratio,
		getClearAlpha: () => alpha,
		setClearAlpha: (value: number) => {
			alpha = value;
		},
		setPixelRatio: (value: number) => {
			ratio = value;
		},
		setSize: (w: number, h: number) => {
			size = new THREE.Vector2(w, h);
		},
		render: (_: THREE.Scene, output: THREE.PerspectiveCamera) => {
			expect(scene.background).toBeNull();
			expect(stage.visible).toBe(false);
			expect(shadow.visible).toBe(true);
			expect(output.view?.width).toBe(640);
			expect(output.view?.height).toBe(640);
			expect(output.view?.offsetX).toBe(180);
			expect(output.view?.offsetY).toBe(80);
			expect(size.toArray()).toEqual([2048, 2048]);
			throw new Error("capture failed");
		},
	} as unknown as THREE.WebGLRenderer;
	const framing = {
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 800 }),
	} as HTMLElement;
	await expect(
		captureSquare({
			renderer,
			scene,
			camera,
			framing,
			edge: 2048,
			transparent: true,
			backgroundObjects: [stage],
		}),
	).rejects.toThrow("capture failed");
	expect(scene.background).toBe(background);
	expect(stage.visible).toBe(true);
	expect(alpha).toBe(1);
	expect(ratio).toBe(2);
	expect(size.toArray()).toEqual([1000, 800]);
	expect(camera.view?.width).toBe(1000);
});
