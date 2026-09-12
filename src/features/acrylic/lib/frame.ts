import type { Outline } from "@/features/acrylic/lib/geometry";
import { MODEL_SCALE, STAGE_FLOOR_Y, type Vector3Tuple } from "@/tuning";

export type Frame = { center: Vector3Tuple; span: number };

// Framing follows what actually stands on the set, so each product contributes
// the parts it has: a base under the sheet, hardware hanging above it.
const FRAME_MARGIN = 0.15;

function bounds(outline: Outline) {
	const xs = outline.points.map((point) => point.x);
	const ys = outline.points.map((point) => point.y);
	return {
		left: Math.min(...xs),
		right: Math.max(...xs),
		bottom: Math.min(...ys),
		top: Math.max(...ys),
	};
}

// An acrylic product stands on the stage floor, centred on what it occupies.
function seat(minX: number, maxX: number, height: number, widest = 0): Frame {
	return {
		center: [(minX + maxX) / 2, STAGE_FLOOR_Y + height / 2, 0],
		span: Math.max(maxX - minX, height, widest) + FRAME_MARGIN,
	};
}

// 任意亚克力 — the sheet alone, framed around the artwork it was cut to.
export function acrylicFrame(outline: Outline, size: number): Frame {
	const scale = size / MODEL_SCALE.sheet;
	const { left, right, bottom, top } = bounds(outline);
	return seat(left * scale, right * scale, (top - bottom) * scale);
}

// 亚克力立牌 — the base is wider than the sheet, so it takes part in the framing.
export function standeeFrame(
	outline: Outline,
	size: number,
	baseDiameter: number,
): Frame {
	const scale = size / MODEL_SCALE.sheet;
	const { left, right, bottom, top } = bounds(outline);
	const base = baseDiameter / 30;
	const baseX = (outline.connector?.x ?? 0) * scale;
	return seat(
		Math.min(left * scale, baseX - base / 2),
		Math.max(right * scale, baseX + base / 2),
		(top - bottom) * scale,
		base,
	);
}

// 亚克力钥匙扣 — the lug and hardware hang above the sheet, so the frame reaches
// past the hole rather than stopping at the artwork.
export function keychainFrame(
	outline: Outline,
	size: number,
	hardware: "ring" | "clasp",
): Frame {
	const scale = size / MODEL_SCALE.sheet;
	const { left, right, bottom } = bounds(outline);
	const translation = STAGE_FLOOR_Y - bottom * scale;
	const minX = Math.min(left, outline.hole.x - 0.47) * scale;
	const maxX = Math.max(right, outline.hole.x + 0.47) * scale;
	const maxY =
		(outline.hole.y + (hardware === "ring" ? 1.54 : 1.48)) * scale +
		translation;
	return {
		center: [(minX + maxX) / 2, (maxY + STAGE_FLOOR_Y) / 2, 0],
		span: Math.max(maxX - minX, maxY - STAGE_FLOOR_Y),
	};
}
