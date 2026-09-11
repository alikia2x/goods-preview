import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { lightDirection, shadowFrustum } from "@/lib/studio/lighting";
import {
	LIGHTING_PRESETS,
	type LightingPreset,
	prepareLightingPreset,
} from "@/lib/studio/lighting-presets";
import { type SceneKind, sceneWallZ } from "@/lib/studio/scenes";

// Kick environment preparation from inside the canvas so the WebGL renderer
// is ready; the page keeps the result and shows status UI outside the canvas.
export function EnvironmentLoader({
	preset,
	onReady,
	onError,
}: {
	preset: LightingPreset;
	onReady: (preset: LightingPreset, target: THREE.WebGLRenderTarget) => void;
	onError: (preset: LightingPreset) => void;
}) {
	const gl = useThree((state) => state.gl);
	useEffect(() => {
		let alive = true;
		prepareLightingPreset(gl, preset).then(
			(target) => {
				if (alive) onReady(preset, target);
			},
			() => {
				if (alive) onError(preset);
			},
		);
		return () => {
			alive = false;
		};
	}, [gl, preset, onReady, onError]);
	return null;
}

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
	const light = useRef<THREE.DirectionalLight>(null);
	const direction = lightDirection(azimuth, elevation);
	const energy = 2 ** ((intensity - 50) / 50) * LIGHTING_PRESETS[preset].gain;
	useEffect(() => {
		if (environment) {
			scene.environment = environment.texture;
			return () => {
				scene.environment = null;
			};
		}
		scene.environment = null;
	}, [scene, environment]);
	useEffect(() => {
		// Rotate the preset's measured main emitter onto the user's direction.
		scene.environmentRotation.setFromQuaternion(
			new THREE.Quaternion().setFromUnitVectors(
				LIGHTING_PRESETS[preset].keyDirection,
				direction,
			),
		);
		scene.environmentIntensity = energy * LIGHTING_PRESETS[preset].intensity;
	}, [scene, direction, energy, preset]);
	useEffect(() => {
		const current = light.current;
		if (!current) return;
		const frustum = shadowFrustum(direction, sceneWallZ(sceneKind));
		const camera = current.shadow.camera;
		camera.left = frustum.left;
		camera.right = frustum.right;
		camera.bottom = frustum.bottom;
		camera.top = frustum.top;
		camera.near = frustum.near;
		camera.far = frustum.far;
		camera.updateProjectionMatrix();
	}, [direction, sceneKind]);
	return (
		<directionalLight
			ref={light}
			position={direction.clone().multiplyScalar(10)}
			intensity={energy * 1.1}
			color="white"
			castShadow
			shadow-mapSize={[2048, 2048]}
			shadow-bias={-0.00015}
			shadow-normalBias={0.002}
			shadow-radius={7}
		/>
	);
}

export const STUDIO_RENDERING = {
	toneMapping: THREE.NeutralToneMapping,
	outputColorSpace: THREE.SRGBColorSpace,
};
