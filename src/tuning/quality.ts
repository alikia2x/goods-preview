// How much detail the preview is willing to trade away to hold its frame rate.
// One sampling window is `windowFrames` long; a window that averages past the
// down threshold counts as over budget, one that averages under the up
// threshold counts as having room. The two thresholds leave a dead band so a
// 60Hz display settles instead of oscillating.
export const ADAPTIVE_RESOLUTION = {
	// The pixel ratio never goes below the floor, nor above what the page opened
	// with: adapting only trades detail away, it never sharpens past the default.
	min: 0.75,
	max: 2,
	// The frame budget: 55fps. Windows are compared against this.
	targetFrameMs: 1000 / 55,
	downFactor: 1.15,
	upFactor: 0.95,
	// One step per adjustment, so a change is a small visible move.
	step: 0.25,
	windowFrames: 36,
	// Dropping is quicker than climbing back, which keeps a heavy scene from
	// flapping up into a stutter.
	downWindows: 2,
	upWindows: 4,
	// Shortest gap between two adjustments; also the settle time that keeps a
	// rebuilt drawing buffer out of the next window.
	cooldownMs: 1000,
	// A single frame longer than this multiple of the budget is a hitch — an
	// export, a background tab, a texture upload — not a frame rate.
	hitchFactor: 6,
	// Shader compiles and environment generation never decide anything.
	warmupMs: 2000,
};
