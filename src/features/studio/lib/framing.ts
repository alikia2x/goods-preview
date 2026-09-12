import type { PerspectiveCamera } from "three";
import type { Vector3Tuple } from "@/tuning";

type Bounds = { left: number; top: number; width: number; height: number };
type HostSize = { width: number; height: number };
type ViewOffset = { offsetX: number; offsetY: number };

// What a product measured about itself: where it ended up, and how wide it is.
export type Frame = { center: Vector3Tuple; span: number };

// Distance at which a product of the given span exactly fills a square crop, with
// the breathing room that product is framed with.
export function studioDistance(span: number, fov: number, fill: number) {
	return (span / 2 / Math.tan(((fov / 2) * Math.PI) / 180)) * fill;
}

// Where a view's camera sits: along a direction from the framed centre, out at the
// framing distance, so every product's seats scale with what it measured.
export function cameraSeat(
	center: Vector3Tuple,
	distance: number,
	direction: Vector3Tuple,
): Vector3Tuple {
	const [x, y, z] = direction;
	const length = Math.hypot(x, y, z) || 1;
	return [
		center[0] + (x / length) * distance,
		center[1] + (y / length) * distance,
		center[2] + (z / length) * distance,
	];
}

// Crop the unobstructed workspace region, independently of the rendering framework.
export function squareCrop(bounds: Bounds) {
	const size = Math.min(bounds.width, bounds.height);
	return {
		left: bounds.left + (bounds.width - size) / 2,
		top: bounds.top + (bounds.height - size) / 2,
		width: size,
		height: size,
	};
}

// Aim the live camera at the unobstructed square: pan the subject onto the crop
// center, then scale the crop region to the host. Both products share this, so a
// layout change (e.g. collapsing the panel) reframes them identically.
export function applyLiveFraming(
	camera: PerspectiveCamera,
	host: HostSize,
	bounds: Bounds,
) {
	const crop = squareCrop(bounds);
	camera.setViewOffset(
		host.width,
		host.height,
		host.width / 2 - (crop.left + crop.width / 2),
		host.height / 2 - (crop.top + crop.height / 2),
		host.width,
		host.height,
	);
	camera.zoom = Math.min(1, crop.height / host.height);
	camera.updateProjectionMatrix();
}

// Aim a cloned camera so the crop region fills a square output edge-to-edge,
// carrying over whatever pan the live camera already had.
export function applyOutputFraming(
	camera: PerspectiveCamera,
	host: HostSize,
	bounds: Bounds,
	view: ViewOffset | null | undefined,
) {
	const crop = squareCrop(bounds);
	camera.setViewOffset(
		host.width,
		host.height,
		(view?.offsetX ?? 0) + crop.left,
		(view?.offsetY ?? 0) + crop.top,
		crop.width,
		crop.height,
	);
}
