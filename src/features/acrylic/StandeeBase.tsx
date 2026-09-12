import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { AcrylicMaterial } from "@/features/acrylic/AcrylicMaterial";
import { createBaseReflection } from "@/features/acrylic/base-reflection";
import { createOpticalShadow } from "@/features/acrylic/optical-shadow";
import { smoothExtrudeGeometry } from "@/features/acrylic/lib/geometry";

// 立牌的底座：a disc with a slot the sheet stands in, plus a local reflection
// that supplies the artwork an environment map cannot contain.
export function StandeeBase({
	baseDiameter,
	connectorHeight,
	thickness,
	gloss,
	size,
	x,
	width,
	bottom,
}: {
	baseDiameter: number;
	connectorHeight: number;
	/** The sheet's thickness in millimetres, which sets the slot's width. */
	thickness: number;
	gloss: number;
	size: number;
	x: number;
	width: number;
	bottom: number;
}) {
	const shadow = useMemo(createOpticalShadow, []);
	useEffect(() => () => shadow.dispose(), [shadow]);
	const depth = (connectorHeight / size) * 2;
	const { geometry, reflection } = useMemo(() => {
		const radius = baseDiameter / size;
		const shape = new THREE.Shape();
		shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
		const halfWidth = width / 2 + 0.004;
		const halfDepth = thickness / size + 0.003;
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
		const geometry = smoothExtrudeGeometry(result);
		return { geometry, reflection: createBaseReflection(shape) };
	}, [baseDiameter, size, width, thickness, depth]);
	useEffect(() => {
		(
			reflection.material as THREE.ShaderMaterial
		).uniforms.reflectionStrength.value = gloss / 100;
	}, [reflection, gloss]);
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
				<AcrylicMaterial attach="material-0" thickness={depth} gloss={gloss} />
				<AcrylicMaterial
					attach="material-1"
					thickness={depth}
					gloss={gloss}
					edge
				/>
			</mesh>
		</group>
	);
}
