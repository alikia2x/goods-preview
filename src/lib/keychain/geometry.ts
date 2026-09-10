import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

function simplifyPath(
	points: THREE.Vector2[],
	tolerance = 0.65,
): THREE.Vector2[] {
	if (points.length < 3) return points;
	const first = points[0],
		last = points[points.length - 1],
		dx = last.x - first.x,
		dy = last.y - first.y,
		length = dx * dx + dy * dy;
	let max = tolerance * tolerance,
		index = -1;
	for (let i = 1; i < points.length - 1; i++) {
		const p = points[i],
			t = length
				? Math.max(
						0,
						Math.min(1, ((p.x - first.x) * dx + (p.y - first.y) * dy) / length),
					)
				: 0;
		const distance =
			(p.x - first.x - t * dx) ** 2 + (p.y - first.y - t * dy) ** 2;
		if (distance > max) {
			max = distance;
			index = i;
		}
	}
	return index < 0
		? [first, last]
		: [
				...simplifyPath(points.slice(0, index + 1), tolerance).slice(0, -1),
				...simplifyPath(points.slice(index), tolerance),
			];
}

export type ArtworkMask = { width: number; height: number; alpha: Uint8Array };
export type Outline = {
	points: THREE.Vector2[];
	hole: THREE.Vector2;
	holeRadius: number;
	width: number;
	height: number;
};

// Work on a bounded raster, then trace its outside boundary. Interior transparent
// pixels remain clear acrylic; only the mounting hole is cut through the sheet.
export function traceOutline(mask: ArtworkMask, borderRatio: number): Outline {
	const { width, height, alpha } = mask;
	if (width < 1 || height < 1 || alpha.length !== width * height)
		throw new Error("图像轮廓数据无效。");
	const radius = Math.max(2, Math.ceil(Math.max(width, height) * borderRatio));
	const resolutionScale = Math.max(width, height) / 192;
	const lugRadius = Math.round(11 * resolutionScale);
	const pad = radius + lugRadius + Math.ceil(3 * resolutionScale) + 3;
	const w = width + pad * 2,
		h = height + pad * 2;
	const filled = new Uint8Array(w * h);
	let top = height,
		anchor = width / 2,
		count = 0;
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++) {
			if (alpha[y * width + x] < 32) continue;
			count++;
			if (y < top) {
				top = y;
				anchor = x;
			}
			for (let dy = -radius; dy <= radius; dy++) {
				const span = Math.floor(Math.sqrt(radius * radius - dy * dy));
				filled.fill(
					1,
					(y + pad + dy) * w + x + pad - span,
					(y + pad + dy) * w + x + pad + span + 1,
				);
			}
		}
	if (!count) throw new Error("图片完全透明，请选择有可见图案的图片。");
	// Prefer the topmost opaque pixel nearest the horizontal center for a stable tab.
	for (let x = 0; x < width; x++)
		if (
			alpha[top * width + x] >= 32 &&
			Math.abs(x - width / 2) < Math.abs(anchor - width / 2)
		)
			anchor = x;
	const cx = anchor + pad,
		cy = top + pad - radius - Math.ceil(3 * resolutionScale);
	for (let y = cy - lugRadius; y <= top + pad; y++)
		for (let x = cx - lugRadius; x <= cx + lugRadius; x++) {
			if (
				(x - cx) ** 2 + (y - cy) ** 2 <= lugRadius ** 2 ||
				(y >= cy && Math.abs(x - cx) <= 7 * resolutionScale)
			)
				filled[y * w + x] = 1;
		}
	const edges = new Map<number, number[]>();
	const vertex = (x: number, y: number) => y * (w + 1) + x;
	const add = (a: number, b: number) => {
		const list = edges.get(a) ?? [];
		list.push(b);
		edges.set(a, list);
	};
	for (let y = 1; y < h - 1; y++)
		for (let x = 1; x < w - 1; x++) {
			if (!filled[y * w + x]) continue;
			if (!filled[(y - 1) * w + x]) add(vertex(x, y), vertex(x + 1, y));
			if (!filled[y * w + x + 1]) add(vertex(x + 1, y), vertex(x + 1, y + 1));
			if (!filled[(y + 1) * w + x]) add(vertex(x + 1, y + 1), vertex(x, y + 1));
			if (!filled[y * w + x - 1]) add(vertex(x, y + 1), vertex(x, y));
		}
	const loops: THREE.Vector2[][] = [];
	while (edges.size) {
		const start = edges.keys().next().value as number;
		let current = start;
		const loop: THREE.Vector2[] = [];
		do {
			loop.push(
				new THREE.Vector2(current % (w + 1), Math.floor(current / (w + 1))),
			);
			const next = edges.get(current);
			if (!next?.length) break;
			const dest = next.pop() as number;
			if (!next.length) edges.delete(current);
			current = dest;
		} while (current !== start);
		if (loop.length > 3) loops.push(loop);
	}
	const outer = loops
		.filter((loop) => THREE.ShapeUtils.area(loop) > 0)
		.sort((a, b) => THREE.ShapeUtils.area(b) - THREE.ShapeUtils.area(a));
	if (!outer[0]) throw new Error("无法生成闭合切边。");
	if (outer.slice(1).some((loop) => THREE.ShapeUtils.area(loop) > 16))
		throw new Error("图案包含分离的部分，请增加透明留边，或将图案连接后上传。");
	// Remove collinear raster points and soften staircase corners without rounding
	// across concavities. The resulting polygon retains the source silhouette.
	const raw = outer[0];
	let split = 1;
	for (let i = 2; i < raw.length; i++)
		if (raw[i].distanceToSquared(raw[0]) > raw[split].distanceToSquared(raw[0]))
			split = i;
	const corners = [
		...simplifyPath(raw.slice(0, split + 1)).slice(0, -1),
		...simplifyPath([...raw.slice(split), raw[0]]).slice(0, -1),
	];
	const smooth: THREE.Vector2[] = [];
	for (let i = 0; i < corners.length; i++) {
		const a = corners[i],
			b = corners[(i + 1) % corners.length];
		const rounding = Math.min(0.25, 1 / a.distanceTo(b));
		smooth.push(a.clone().lerp(b, rounding), a.clone().lerp(b, 1 - rounding));
	}
	const unit = 2 / Math.max(width, height);
	const convert = (p: THREE.Vector2) =>
		new THREE.Vector2(
			(p.x - pad - width / 2) * unit,
			(height / 2 - (p.y - pad)) * unit,
		);
	return {
		points: smooth.map(convert),
		hole: convert(new THREE.Vector2(cx, cy)),
		holeRadius: 4 * resolutionScale * unit,
		width: width * unit,
		height: height * unit,
	};
}

export function acrylicGeometry(outline: Outline, thickness: number) {
	const shape = new THREE.Shape(outline.points);
	const hole = new THREE.Path();
	hole.absarc(
		outline.hole.x,
		outline.hole.y,
		outline.holeRadius,
		0,
		Math.PI * 2,
		true,
	);
	shape.holes.push(hole);
	const bevel = Math.min(0.008, thickness / 8);
	const geometry = new THREE.ExtrudeGeometry(shape, {
		depth: thickness - 2 * bevel,
		bevelEnabled: true,
		bevelThickness: bevel,
		bevelSize: bevel,
		bevelSegments: 3,
		steps: 1,
		curveSegments: 40,
	});
	geometry.translate(0, 0, -thickness / 2 + bevel);
	// The utility hashes positions at 0.01 units. Work at a larger scale so
	// distinct sub-millimeter bevel vertices do not get merged into one normal.
	geometry.scale(100, 100, 100);
	const smooth = toCreasedNormals(geometry, Math.PI / 3);
	smooth.scale(0.01, 0.01, 0.01);
	if (smooth !== geometry) geometry.dispose();
	return smooth;
}

export function keychainFrame(
	outline: Outline,
	size: number,
	hardware: "ring" | "clasp",
) {
	const scale = size / 60;
	const bottom = Math.min(...outline.points.map((point) => point.y));
	const translation = -1 - bottom * scale;
	const minX =
		Math.min(...outline.points.map((point) => point.x), outline.hole.x - 0.47) *
		scale;
	const maxX =
		Math.max(...outline.points.map((point) => point.x), outline.hole.x + 0.47) *
		scale;
	const maxY =
		(outline.hole.y + (hardware === "ring" ? 1.54 : 1.48)) * scale +
		translation;
	return {
		center: [(minX + maxX) / 2, (maxY - 1) / 2, 0] as [number, number, number],
		span: Math.max(maxX - minX, maxY + 1),
	};
}
