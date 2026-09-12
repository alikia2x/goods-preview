import type { ADAPTIVE_RESOLUTION } from "@/tuning";

export type ResolutionConfig = typeof ADAPTIVE_RESOLUTION;

export type ResolutionController = {
	readonly dpr: number;
	/** Feed one frame's duration in milliseconds; returns a new pixel ratio when
	 * the samples say it is time to move, otherwise null. */
	sample: (frameMs: number, nowMs: number) => number | null;
};

// What the preview opened with: r3f clamps a `[min, max]` pixel ratio against
// the display, which means never below 1:1 and never past the tuned ceiling.
export function openingPixelRatio(config: ResolutionConfig) {
	const device =
		typeof window === "undefined"
			? config.max
			: (window.devicePixelRatio ?? config.max);
	return Math.min(Math.max(1, device), config.max);
}

export function createResolutionController(
	config: ResolutionConfig,
	opening: number,
): ResolutionController {
	const floor = config.min;
	// Adapting trades detail away; it never sharpens past the opening ratio.
	const ceiling = Math.min(config.max, opening);
	const budget = config.targetFrameMs;
	let dpr = Math.min(Math.max(opening, floor), ceiling);
	let startedAt: number | null = null;
	let changedAt = Number.NEGATIVE_INFINITY;
	let frames: number[] = [];
	let over = 0,
		under = 0;

	const move = (next: number, nowMs: number) => {
		dpr = Math.round(next * 100) / 100;
		changedAt = nowMs;
		over = 0;
		under = 0;
		frames = [];
		return dpr;
	};

	return {
		get dpr() {
			return dpr;
		},
		sample(frameMs, nowMs) {
			// Shader compiles and environment generation never decide anything.
			if (startedAt === null) startedAt = nowMs;
			if (nowMs - startedAt < config.warmupMs) return null;
			if (!Number.isFinite(frameMs) || frameMs <= 0) return null;
			// A hitch — an export, a background tab, a texture upload — is capped
			// rather than dropped: one of them among healthy frames cannot move the
			// mean, while a device that produces nothing but hitches still adapts.
			frames.push(Math.min(frameMs, budget * config.hitchFactor));
			if (frames.length < config.windowFrames) return null;
			const mean =
				frames.reduce((total, frame) => total + frame, 0) / frames.length;
			frames = [];
			// Beyond the dead band between the two thresholds a window either counts
			// as over budget or as having room; inside it, neither.
			if (mean > budget * config.downFactor) {
				over++;
				under = 0;
			} else if (mean < budget * config.upFactor) {
				under++;
				over = 0;
			} else {
				over = 0;
				under = 0;
			}
			if (nowMs - changedAt < config.cooldownMs) return null;
			if (over >= config.downWindows && dpr > floor)
				return move(Math.max(floor, dpr - config.step), nowMs);
			if (under >= config.upWindows && dpr < ceiling)
				return move(Math.min(ceiling, dpr + config.step), nowMs);
			return null;
		},
	};
}
