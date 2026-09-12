import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";

function simplifyPath(
	points: THREE.Vector2[],
	tolerance = 1.1,
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

// A naive circular dilation touches every source pixel for every pixel in its
// radius. That is fine for a small preview mask, but becomes impractical as the
// mask is made sharper. An exact squared Euclidean distance transform keeps the
// higher-resolution outline linear in the number of raster pixels instead.
function distanceTransform1D(
	source: Float64Array,
	target: Float64Array,
	length: number,
	sourceOffset: number,
	sourceStride: number,
	targetOffset: number,
	targetStride: number,
	envelope: Int32Array,
	intersections: Float64Array,
) {
	const sourceAt = (index: number) =>
		source[sourceOffset + index * sourceStride];
	let first = -1;
	for (let index = 0; index < length; index++)
		if (Number.isFinite(sourceAt(index))) {
			first = index;
			break;
		}
	if (first < 0) {
		for (let index = 0; index < length; index++)
			target[targetOffset + index * targetStride] = Number.POSITIVE_INFINITY;
		return;
	}

	let last = 0;
	envelope[0] = first;
	intersections[0] = Number.NEGATIVE_INFINITY;
	intersections[1] = Number.POSITIVE_INFINITY;
	for (let index = first + 1; index < length; index++) {
		const value = sourceAt(index);
		if (!Number.isFinite(value)) continue;
		let intersection = Number.POSITIVE_INFINITY;
		while (last >= 0) {
			const previous = envelope[last];
			intersection =
				(value + index * index - (sourceAt(previous) + previous * previous)) /
				(2 * (index - previous));
			if (intersection > intersections[last]) break;
			last--;
		}
		last++;
		envelope[last] = index;
		intersections[last] = intersection;
		intersections[last + 1] = Number.POSITIVE_INFINITY;
	}

	last = 0;
	for (let index = 0; index < length; index++) {
		while (intersections[last + 1] < index) last++;
		const nearest = envelope[last];
		const delta = index - nearest;
		target[targetOffset + index * targetStride] =
			delta * delta + sourceAt(nearest);
	}
}

function dilateAlpha(
	alpha: Uint8Array,
	width: number,
	height: number,
	paddedWidth: number,
	paddedHeight: number,
	pad: number,
	radius: number,
) {
	const size = paddedWidth * paddedHeight;
	const distances = new Float64Array(size);
	distances.fill(Number.POSITIVE_INFINITY);
	for (let y = 0; y < height; y++)
		for (let x = 0; x < width; x++)
			if (alpha[y * width + x] >= 32)
				distances[(y + pad) * paddedWidth + x + pad] = 0;
	const horizontal = new Float64Array(size);
	const envelope = new Int32Array(Math.max(paddedWidth, paddedHeight));
	const intersections = new Float64Array(envelope.length + 1);
	for (let y = 0; y < paddedHeight; y++)
		distanceTransform1D(
			distances,
			horizontal,
			paddedWidth,
			y * paddedWidth,
			1,
			y * paddedWidth,
			1,
			envelope,
			intersections,
		);
	for (let x = 0; x < paddedWidth; x++)
		distanceTransform1D(
			horizontal,
			distances,
			paddedHeight,
			x,
			paddedWidth,
			x,
			paddedWidth,
			envelope,
			intersections,
		);
	const filled = new Uint8Array(size);
	const squaredRadius = radius * radius;
	for (let index = 0; index < size; index++)
		if (distances[index] <= squaredRadius) filled[index] = 1;
	return filled;
}

export type ArtworkMask = { width: number; height: number; alpha: Uint8Array };
export type Outline = {
	points: THREE.Vector2[];
	hole: THREE.Vector2;
	holeRadius: number;
	width: number;
	height: number;
	connector?: { x: number; width: number };
};

// Work on a bounded raster, then trace its outside boundary. Interior transparent
// pixels remain clear acrylic; only the mounting hole is cut through the sheet.
export type OutlineMount = {
	width: number;
	height: number;
	x: number;
	gap: number;
};

export function traceOutline(
	mask: ArtworkMask,
	borderRatio: number,
	mount: "keychain" | OutlineMount | null = "keychain",
): Outline {
	const { width, height, alpha } = mask;
	if (width < 1 || height < 1 || alpha.length !== width * height)
		throw new Error("图像轮廓数据无效。");
	const radius = Math.max(2, Math.ceil(Math.max(width, height) * borderRatio));
	const resolutionScale = Math.max(width, height) / 192;
	const lugRadius = Math.round(11 * resolutionScale);
	const extra =
		typeof mount === "object" && mount
			? Math.ceil(
					(mount.gap + mount.height + mount.width) * Math.max(width, height),
				)
			: 0;
	const pad = radius + lugRadius + Math.ceil(3 * resolutionScale) + 3 + extra;
	const w = width + pad * 2,
		h = height + pad * 2;
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
		}
	if (!count) throw new Error("图片完全透明，请选择有可见图案的图片。");
	const filled = dilateAlpha(alpha, width, height, w, h, pad, radius);
	// Prefer the topmost opaque pixel nearest the horizontal center for a stable tab.
	for (let x = 0; x < width; x++)
		if (
			alpha[top * width + x] >= 32 &&
			Math.abs(x - width / 2) < Math.abs(anchor - width / 2)
		)
			anchor = x;
	const cx = anchor + pad,
		cy = top + pad - radius - Math.ceil(3 * resolutionScale);
	if (mount === "keychain")
		for (let y = cy - lugRadius; y <= top + pad; y++)
			for (let x = cx - lugRadius; x <= cx + lugRadius; x++) {
				if (
					(x - cx) ** 2 + (y - cy) ** 2 <= lugRadius ** 2 ||
					(y >= cy && Math.abs(x - cx) <= 7 * resolutionScale)
				)
					filled[y * w + x] = 1;
			}
	let connector: Outline["connector"];
	if (mount && typeof mount === "object") {
		const pixels = Math.max(width, height);
		let bottom = 0;
		let left = w,
			right = 0;
		for (let y = 1; y < h - 1; y++)
			for (let x = 1; x < w - 1; x++) {
				if (filled[y * w + x]) {
					bottom = Math.max(bottom, y);
					left = Math.min(left, x);
					right = Math.max(right, x);
				}
			}
		const half = Math.max(1, Math.round((mount.width * pixels) / 2));
		const center = Math.round(
			(left + right) / 2 + (mount.x * (right - left)) / 2,
		);
		const start = center - half;
		const end = center + half;
		connector = {
			x: (((start + end + 1) / 2 - pad - width / 2) * 2) / pixels,
			width: ((end - start + 1) * 2) / pixels,
		};
		const foot = bottom + Math.ceil((mount.gap + mount.height) * pixels);
		const shoulder = bottom + Math.ceil(mount.gap * pixels);
		// Project every column upward to its first intersection, then union in
		// the raster before tracing. Empty columns join via the common shoulder.
		for (let x = start; x <= end; x++) {
			let hit = bottom;
			while (hit > 0 && !filled[hit * w + x]) hit--;
			for (let y = hit > 0 ? hit : shoulder; y <= foot; y++)
				filled[y * w + x] = 1;
		}
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
		connector,
		points: smooth.map(convert),
		hole: convert(new THREE.Vector2(cx, cy)),
		holeRadius: mount === "keychain" ? 4 * resolutionScale * unit : 0,
		width: width * unit,
		height: height * unit,
	};
}

// A sheet is measured in millimetres against the artwork's long edge, and the
// traced outline is normalised to two units, so the model thickness is that
// ratio doubled.
export function sheetThickness(thickness: number, size: number) {
	return (thickness / size) * 2;
}

// ExtrudeGeometry stores its planar lids in material group 0 and its bevels and
// walls in group 1. Smooth the curved parts, but keep the lids exactly planar:
// allowing their normals to blend with the bevel exposes the lid triangulation
// in glossy reflections and in MeshPhysicalMaterial's refraction lookup.
export function smoothExtrudeGeometry(geometry: THREE.BufferGeometry) {
	// The utility hashes positions at 0.01 units. Work at a larger scale so
	// distinct sub-millimeter bevel vertices do not get merged into one normal.
	geometry.scale(100, 100, 100);
	const smooth = toCreasedNormals(geometry, Math.PI / 3);
	const cap = smooth.groups.find((group) => group.materialIndex === 0);
	if (cap) {
		smooth.computeBoundingBox();
		const bounds = smooth.boundingBox;
		if (bounds) {
			const positions = smooth.getAttribute("position");
			const normals = smooth.getAttribute("normal");
			const middle = (bounds.min.z + bounds.max.z) / 2;
			for (let index = cap.start; index < cap.start + cap.count; index++)
				normals.setXYZ(index, 0, 0, positions.getZ(index) < middle ? -1 : 1);
			normals.needsUpdate = true;
		}
	}
	smooth.scale(0.01, 0.01, 0.01);
	if (smooth !== geometry) geometry.dispose();
	return smooth;
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
	if (outline.holeRadius > 0) shape.holes.push(hole);
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
	return smoothExtrudeGeometry(geometry);
}
