import * as THREE from "three";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";
import type { Outline } from "@/features/acrylic/lib/geometry";

export type AcrylicWindow = {
	artwork: KeychainArtwork;
	/** The decoded image, including the alpha that controls the tinted coverage. */
	image: HTMLImageElement | HTMLCanvasElement;
};

type Bounds = {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
};

export function windowBounds(outline: Outline): Bounds {
	const xs = outline.points.map((point) => point.x);
	const ys = outline.points.map((point) => point.y);
	return {
		minX: Math.min(...xs),
		maxX: Math.max(...xs),
		minY: Math.min(...ys),
		maxY: Math.max(...ys),
	};
}

// A rectangular tint plane remains visible outside a concave cut line. Give the
// tint the sheet's real face instead, including the mounting hole, and normalise
// its UVs to the same bounds used by buildWindowTint.
export function buildWindowGeometry(outline: Outline): THREE.ShapeGeometry {
	const shape = new THREE.Shape(outline.points);
	if (outline.holeRadius > 0) {
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
	}
	const geometry = new THREE.ShapeGeometry(shape, 40);
	const bounds = windowBounds(outline);
	const width = Math.max(Number.EPSILON, bounds.maxX - bounds.minX);
	const height = Math.max(Number.EPSILON, bounds.maxY - bounds.minY);
	const positions = geometry.getAttribute("position");
	const uvs = geometry.getAttribute("uv");
	for (let index = 0; index < positions.count; index++)
		uvs.setXY(
			index,
			(positions.getX(index) - bounds.minX) / width,
			(positions.getY(index) - bounds.minY) / height,
		);
	uvs.needsUpdate = true;
	return geometry;
}

// The 彩窗 image, ready to be laid over the sheet. The tint keeps its own colour
// and alpha; the artwork's coverage stays in the printed texture, so a design
// can never be made opaque by the window.
export function buildWindowTint(
	artwork: HTMLCanvasElement,
	outline: Outline,
	image: HTMLImageElement | HTMLCanvasElement,
): HTMLCanvasElement {
	// The tint spans the whole cut sheet, not just the artwork's bounding box,
	// so the canvas matches the dilated outline the sheet is cut from.
	const { minX, maxX, minY, maxY } = windowBounds(outline);
	const scale = artwork.width / outline.width;
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round((maxX - minX) * scale));
	canvas.height = Math.max(1, Math.round((maxY - minY) * scale));
	const context = canvas.getContext("2d");
	if (!context) return canvas;
	const width =
		image instanceof HTMLImageElement ? image.naturalWidth : image.width;
	const height =
		image instanceof HTMLImageElement ? image.naturalHeight : image.height;
	context.drawImage(
		image,
		0,
		0,
		width,
		height,
		0,
		0,
		canvas.width,
		canvas.height,
	);
	// The artwork's alpha wins wherever it is printed. The window takes over only
	// where the print left clear, and the alpha it carries there is its own — so
	// the coated area reads as coloured light through acrylic at any strength.
	context.globalCompositeOperation = "destination-out";
	context.drawImage(
		artwork,
		(-outline.width / 2 - minX) * scale,
		(maxY - outline.height / 2) * scale,
		outline.width * scale,
		outline.height * scale,
	);
	return canvas;
}
