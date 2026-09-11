import { useCallback, useState } from "react";
import type * as THREE from "three";
import type { LightingPreset } from "@/features/studio/lib/lighting-presets";

// PMREM targets are per GL context, so each workspace caches the presets it has
// prepared and hands the active one to the lighting. Shared by both products.
export function useStudioEnvironment(lighting: LightingPreset) {
	const [environments, setEnvironments] = useState<
		Partial<Record<LightingPreset, THREE.WebGLRenderTarget>>
	>({});
	const [environmentError, setEnvironmentError] = useState(false);

	const onEnvironmentReady = useCallback(
		(preset: LightingPreset, target: THREE.WebGLRenderTarget) => {
			setEnvironments((current) => ({ ...current, [preset]: target }));
			setEnvironmentError(false);
		},
		[],
	);
	const onEnvironmentError = useCallback(() => setEnvironmentError(true), []);

	return {
		environment: environments[lighting] ?? null,
		environmentError,
		onEnvironmentReady,
		onEnvironmentError,
	};
}
