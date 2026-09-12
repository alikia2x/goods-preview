import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { lightDirection, shadowFrustum } from "@/features/studio/lib/lighting";
import {
	lightEnergy,
	LIGHTING_PRESETS,
	type LightingPreset,
} from "@/features/studio/lib/lighting-presets";
import {
	isPhotographicPreset,
	loadPhotographicEnvironment,
} from "@/features/studio/lib/photographic-environment";
import {
	sampleEnvironment,
	type EnvironmentLightSample,
} from "@/features/studio/lib/environment-sampling";
import { type SceneKind, sceneWallZ } from "@/tuning";

function SampleLight({
	direction,
	color,
	energy,
	shadow,
	scene,
	span,
	castsShadow,
}: EnvironmentLightSample & {
	shadow: number;
	scene: SceneKind;
	span: number;
	castsShadow: boolean;
}) {
	const light = useRef<THREE.DirectionalLight>(null);
	const distance = Math.max(15, span * 3);
	useEffect(() => {
		if (!light.current || !castsShadow) return;
		const box = shadowFrustum(
			direction,
			sceneWallZ(scene),
			[-span, -1.1, -2],
			[span, span + 1, 2],
			distance,
		);
		Object.assign(light.current.shadow.camera, box);
		light.current.shadow.camera.updateProjectionMatrix();
	}, [direction, scene, span, distance, castsShadow]);
	return (
		<directionalLight
			ref={light}
			position={direction.clone().multiplyScalar(distance)}
			color={color}
			intensity={energy}
			castShadow={castsShadow}
			shadow-mapSize={[2048, 2048]}
			shadow-bias={-0.00015}
			shadow-normalBias={0.001}
			shadow-radius={5}
			shadow-intensity={shadow / 100}
		/>
	);
}

export function AcrylicKeyLight({
	preset,
	intensity,
	azimuth,
	elevation,
	scene,
	shadow,
	span = 4,
}: {
	preset: LightingPreset;
	intensity: number;
	azimuth: number;
	elevation: number;
	scene: SceneKind;
	shadow: number;
	span?: number;
}) {
	const [samples, setSamples] = useState<EnvironmentLightSample[]>([]);
	useEffect(() => {
		let alive = true;
		setSamples([]);
		if (!isPhotographicPreset(preset)) return;
		loadPhotographicEnvironment(preset)
			.then((source) => {
				if (alive) setSamples(sampleEnvironment(source));
			})
			.catch(() => {
				if (alive) setSamples([]);
			});
		return () => {
			alive = false;
		};
	}, [preset]);
	const gain = lightEnergy(preset, intensity, scene);
	const lights = useMemo(() => {
		const direction = lightDirection(azimuth, elevation);
		if (!isPhotographicPreset(preset) || !samples.length)
			return [
				{
					direction,
					color: new THREE.Color("white"),
					energy: 1,
					castsShadow: true,
				},
			];
		const rotation = new THREE.Quaternion().setFromUnitVectors(
			LIGHTING_PRESETS[preset].keyDirection,
			direction,
		);
		return samples.map((sample) => ({
			// Only the dominant emitter casts a resolved shadow. Other HDR cells
			// supply fill: treating every cell as a hard light creates replicas.
			castsShadow: sample === samples[0],
			...sample,
			direction: sample.direction.clone().applyQuaternion(rotation),
			energy: sample.energy,
		}));
	}, [azimuth, elevation, preset, samples]);
	return (
		<>
			{lights.map((sample) => (
				<SampleLight
					key={sample.color.getHexString() + sample.energy.toFixed(6)}
					{...sample}
					energy={sample.energy * gain}
					shadow={shadow}
					scene={scene}
					span={span}
				/>
			))}
		</>
	);
}
