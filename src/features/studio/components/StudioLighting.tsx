import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { lightDirection } from "@/features/studio/lib/lighting";
import {
	environmentEnergy,
	LIGHTING_PRESETS,
	type LightingPreset,
	prepareLightingPreset,
} from "@/features/studio/lib/lighting-presets";
import type { SceneKind } from "@/tuning";

// Kick environment preparation from inside the canvas so the WebGL renderer
// is ready; the page keeps the result and shows status UI outside the canvas.
export function EnvironmentLoader({
	preset,
	onEnvironmentReady,
	onError,
}: {
	preset: LightingPreset;
	onEnvironmentReady: (
		preset: LightingPreset,
		target: THREE.WebGLRenderTarget,
	) => void;
	onError: (preset: LightingPreset) => void;
}) {
	const gl = useThree((state) => state.gl);
	useEffect(() => {
		let alive = true;
		prepareLightingPreset(gl, preset).then(
			(target) => {
				if (alive) onEnvironmentReady(preset, target);
			},
			() => {
				if (alive) onError(preset);
			},
		);
		return () => {
			alive = false;
		};
	}, [gl, preset, onEnvironmentReady, onError]);
	return null;
}

// Image-based lighting only, shared by every product. A product that also needs
// a shadow-casting key light adds one next to its own shadow receiver.
export function StudioLighting({
	environment,
	preset,
	intensity,
	azimuth,
	elevation,
	scene: sceneKind,
}: {
	environment: THREE.WebGLRenderTarget | null;
	preset: LightingPreset;
	intensity: number;
	azimuth: number;
	elevation: number;
	scene: SceneKind;
}) {
	const { scene } = useThree();
	const direction = lightDirection(azimuth, elevation);
	const energy = environmentEnergy(preset, intensity, sceneKind);

	useEffect(() => {
		scene.environment = environment ? environment.texture : null;
		return () => {
			scene.environment = null;
		};
	}, [scene, environment]);

	useEffect(() => {
		// The source is sampled during loading; do not rotate an unmeasured rig.
		if (!environment) return;
		// Rotate the preset's measured main emitter onto the user's direction.
		scene.environmentRotation.setFromQuaternion(
			new THREE.Quaternion().setFromUnitVectors(
				LIGHTING_PRESETS[preset].keyDirection,
				direction,
			),
		);
		scene.environmentIntensity = energy * LIGHTING_PRESETS[preset].intensity;
	}, [scene, direction, energy, preset, environment]);

	return null;
}

export const STUDIO_RENDERING = {
	toneMapping: THREE.NeutralToneMapping,
	outputColorSpace: THREE.SRGBColorSpace,
};
