import { sheetThickness, type Outline } from "@/features/acrylic/lib/geometry";
import type { AcrylicPose } from "@/features/acrylic/settings";
import type { Frame } from "@/features/studio/lib/framing";
import { MODEL_SCALE, STAGE_FLOOR_Y } from "@/tuning";

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

// 任意亚克力 — the sheet alone, framed around the artwork it was cut to. Lying
// flat, the footprint it occupies is the outline spread across the floor.
export function acrylicFrame(
	outline: Outline,
	size: number,
	thickness: number,
	pose: AcrylicPose = "standing",
): Frame {
	const scale = size / MODEL_SCALE.sheet;
	const { left, right, bottom, top } = bounds(outline);
	if (pose === "flat") {
		return {
			center: [
				((left + right) / 2) * scale,
				STAGE_FLOOR_Y + (sheetThickness(thickness, size) * scale) / 2,
				0,
			],
			span:
				Math.max((right - left) * scale, (top - bottom) * scale) + FRAME_MARGIN,
		};
	}
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
// past the hole rather than stopping at the artwork. The hardware keeps a fixed
// physical size, so its reach past the hole does not grow with the sheet.
export function keychainFrame(
	outline: Outline,
	size: number,
	hardware: "ring" | "clasp",
): Frame {
	const scale = size / MODEL_SCALE.sheet;
	const { left, right, bottom } = bounds(outline);
	const translation = STAGE_FLOOR_Y - bottom * scale;
	const holeX = outline.hole.x * scale;
	const holeY = outline.hole.y * scale + translation;
	const minX = Math.min(left * scale, holeX - 0.47);
	const maxX = Math.max(right * scale, holeX + 0.47);
	const maxY = holeY + (hardware === "ring" ? 1.54 : 1.48);
	return {
		center: [(minX + maxX) / 2, (maxY + STAGE_FLOOR_Y) / 2, 0],
		span: Math.max(maxX - minX, maxY - STAGE_FLOOR_Y),
	};
}
