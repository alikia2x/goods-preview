import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { createResolutionController } from "@/features/studio/lib/adaptive-resolution";
import { ADAPTIVE_RESOLUTION } from "@/tuning";

// The one place the preview is measured: it reads the frame times the render
// loop already produces and hands a new pixel ratio back up to the canvas. The
// canvas owns the value, because r3f re-asserts the `dpr` prop on every render.
export function AdaptiveResolution({
	opening,
	onDprChange,
}: {
	opening: number;
	onDprChange: (dpr: number) => void;
}) {
	const controller = useMemo(
		() => createResolutionController(ADAPTIVE_RESOLUTION, opening),
		[opening],
	);
	useFrame((_state, delta) => {
		const next = controller.sample(delta * 1000, performance.now());
		if (next !== null) onDprChange(next);
	});
	return null;
}
