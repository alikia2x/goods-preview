import type { WebGLRenderer } from "three";
import { createStudioEnvironment } from "../studio/environment";
import { FINISHES, type Finish } from "./finishes";

// Preserve the tuned badge profiles while sharing the environment generator.
export function studioEnvironment(renderer: WebGLRenderer, finish: Finish) {
	const preset = FINISHES[finish];
	return createStudioEnvironment(renderer, {
		fill: preset.environmentFill,
		peak: preset.environmentPeak,
		width: preset.environmentWidth,
		elongated: finish === "glossy",
	});
}

export function exportDimensions(edge: number) {
	return { width: edge, height: edge };
}
