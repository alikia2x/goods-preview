import type * as THREE from "three";

// The imperative badge loop and the R3F loop both call tickDebug, so one
// dev-only panel can read FPS, renderer info and WebGL context health.
export type DebugSnapshot = {
	fps: number;
	frameMs: number;
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
	hooked: THREE.WebGLRenderer | null = null;

export function tickDebug(renderer: THREE.WebGLRenderer) {
	frames++;
	if (renderer !== hooked) {
		hooked = renderer;
		renderer.domElement.addEventListener("webglcontextlost", () => {
			debugSnapshot.contextLost = true;
		});
		renderer.domElement.addEventListener("webglcontextrestored", () => {
			debugSnapshot.contextLost = false;
		});
	}
	const now = performance.now(),
		elapsed = now - lastUpdate;
	if (elapsed < INTERVAL_MS) return;
	debugSnapshot.fps = (frames / elapsed) * 1000;
	debugSnapshot.frameMs = elapsed / frames;
	frames = 0;
	lastUpdate = now;
	const info = renderer.info;
	debugSnapshot.drawCalls = info.render.calls;
	debugSnapshot.triangles = info.render.triangles;
	debugSnapshot.geometries = info.memory.geometries;
	debugSnapshot.textures = info.memory.textures;
	debugSnapshot.programs = info.programs?.length ?? 0;
}
