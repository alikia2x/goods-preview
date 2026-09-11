import { createOpticalShadow } from "@/features/acrylic/optical-shadow";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { createBaseReflection } from "@/features/acrylic/base-reflection";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AcrylicMaterial } from "@/features/acrylic/AcrylicMaterial";
import type { KeychainSettings } from "@/features/keychain/settings";

export function StandeeBase({
	settings,
	x,
	width,
	bottom,
}: {
	settings: KeychainSettings;
	x: number;
	width: number;
	bottom: number;
}) {
	const shadow = useMemo(createOpticalShadow, []);
	useEffect(() => () => shadow.dispose(), [shadow]);
	const depth = (settings.connectorHeight / settings.size) * 2;
	const { geometry, reflection } = useMemo(() => {
		const radius = settings.baseDiameter / settings.size;
		const shape = new THREE.Shape();
		shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
		const halfWidth = width / 2 + 0.004;
		const halfDepth = settings.thickness / settings.size + 0.003;
		const slot = new THREE.Path();
		slot.moveTo(-halfWidth, -halfDepth);
		slot.lineTo(-halfWidth, halfDepth);
		slot.lineTo(halfWidth, halfDepth);
		slot.lineTo(halfWidth, -halfDepth);
		slot.closePath();
		shape.holes.push(slot);
		const result = new THREE.ExtrudeGeometry(shape, {
			depth,
			steps: 1,
			bevelEnabled: true,
			bevelSize: 0.008,
			bevelThickness: 0.006,
			bevelSegments: 4,
			curveSegments: 96,
		});
		result.scale(100, 100, 100);
		const geometry = toCreasedNormals(result, Math.PI / 3);
		geometry.scale(0.01, 0.01, 0.01);
		if (geometry !== result) result.dispose();
		return { geometry, reflection: createBaseReflection(shape) };
	}, [settings.baseDiameter, settings.size, width, settings.thickness, depth]);
	useEffect(() => {
		(
			reflection.material as THREE.ShaderMaterial
		).uniforms.reflectionStrength.value = settings.gloss / 100;
	}, [reflection, settings.gloss]);
	useEffect(
		() => () => {
			geometry.dispose();
			reflection.geometry.dispose();
			reflection.dispose();
		},
		[geometry, reflection],
	);
	return (
		<group>
			<primitive
				object={reflection}
				position={[x, bottom + depth + 0.013, 0]}
				rotation={[-Math.PI / 2, 0, 0]}
			/>
			<mesh
				castShadow
				customDepthMaterial={shadow}
				geometry={geometry}
				position={[x, bottom + 0.006, 0]}
				rotation={[-Math.PI / 2, 0, 0]}
				dispose={null}
			>
				<AcrylicMaterial
					attach="material-0"
					thickness={depth}
					gloss={settings.gloss}
				/>
				<AcrylicMaterial
					attach="material-1"
					thickness={depth}
					gloss={settings.gloss}
					edge
				/>
			</mesh>
		</group>
	);
}
