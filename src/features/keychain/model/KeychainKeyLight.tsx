import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { lightDirection, shadowFrustum } from "@/features/studio/lib/lighting";
import {
	lightEnergy,
	type LightingPreset,
} from "@/features/studio/lib/lighting-presets";
import { type SceneKind, sceneWallZ } from "@/features/studio/lib/scenes";

// The keychain casts through alpha-tested geometry, so it needs a real shadow
// map. This is that shadow's caster and the frustum that fits it; the badge
// instead runs a depth-only contact-shadow pass and needs no direct light.
export function KeychainKeyLight({
	preset,
	intensity,
	azimuth,
	elevation,
	scene: sceneKind,
}: {
	preset: LightingPreset;
	intensity: number;
	azimuth: number;
	elevation: number;
	scene: SceneKind;
}) {
	const light = useRef<THREE.DirectionalLight>(null);
	const direction = lightDirection(azimuth, elevation);
	const energy = lightEnergy(preset, intensity, sceneKind);

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
