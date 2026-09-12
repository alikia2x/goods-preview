import type * as THREE from "three";

// The imperative badge loop and the R3F loop both call tickDebug, so one
// dev-only panel can read FPS, renderer info and WebGL context health.
export type DebugSnapshot = {
	fps: number;
	frameMs: number;
	/** The live renderer pixel ratio, which adaptive resolution moves. */
	dpr: number;
	drawCalls: number;
	triangles: number;
	geometries: number;
	textures: number;
	programs: number;
	contextLost: boolean;
};

export const debugSnapshot: DebugSnapshot = {
	fps: 0,
	frameMs: 0,
	dpr: 0,
	drawCalls: 0,
	triangles: 0,
	geometries: 0,
	textures: 0,
	programs: 0,
	contextLost: false,
};

const INTERVAL_MS = 500;
let frames = 0,
	lastUpdate = performance.now(),
	hooked: THREE.WebGLRenderer | null = null,
	unhook: (() => void) | null = null;

// Switching products disposes the old renderer, which fires webglcontextlost on
// its canvas. Follow the renderer that is actually drawing: detach the old
// listeners and read the new context's real state, so a disposed context's loss
// event never sticks to the live one.
function hookContext(renderer: THREE.WebGLRenderer) {
	if (renderer === hooked) return;
	unhook?.();
	hooked = renderer;
	const element = renderer.domElement;
	const onLost = () => {
		debugSnapshot.contextLost = true;
	};
	const onRestored = () => {
		debugSnapshot.contextLost = false;
	};
	element.addEventListener("webglcontextlost", onLost);
	element.addEventListener("webglcontextrestored", onRestored);
	unhook = () => {
		element.removeEventListener("webglcontextlost", onLost);
		element.removeEventListener("webglcontextrestored", onRestored);
	};
	debugSnapshot.contextLost = renderer.getContext().isContextLost();
}

export function tickDebug(renderer: THREE.WebGLRenderer) {
	frames++;
	hookContext(renderer);
	const now = performance.now(),
		elapsed = now - lastUpdate;
	if (elapsed < INTERVAL_MS) return;
	debugSnapshot.fps = (frames / elapsed) * 1000;
	debugSnapshot.frameMs = elapsed / frames;
	debugSnapshot.dpr = renderer.getPixelRatio();
	frames = 0;
	lastUpdate = now;
	const info = renderer.info;
	debugSnapshot.drawCalls = info.render.calls;
	debugSnapshot.triangles = info.render.triangles;
	debugSnapshot.geometries = info.memory.geometries;
	debugSnapshot.textures = info.memory.textures;
	debugSnapshot.programs = info.programs?.length ?? 0;
}
