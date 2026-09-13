import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { AcrylicMaterial } from "@/features/acrylic/AcrylicMaterial";
import type { BaseArtwork } from "@/features/acrylic/lib/base-artwork";
import { createBaseReflection } from "@/features/acrylic/base-reflection";
import { createOpticalShadow } from "@/features/acrylic/optical-shadow";
import { smoothExtrudeGeometry } from "@/features/acrylic/lib/geometry";

// 立牌的底座：a disc with a slot the sheet stands in, plus a local reflection
// that supplies the artwork an environment map cannot contain.
export function StandeeBase({
	baseDiameter,
	artwork,
	connectorHeight,
	thickness,
	gloss,
	size,
	x,
	width,
	bottom,
}: {
	baseDiameter: number;
	artwork?: BaseArtwork | null;
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
	const { geometry, patternGeometry, reflection } = useMemo(() => {
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
		return {
			geometry,
			patternGeometry: new THREE.ShapeGeometry(shape, 96),
			reflection: createBaseReflection(shape),
		};
	}, [baseDiameter, size, width, thickness, depth]);
	const texture = useMemo(() => {
		if (!artwork) return null;
		const value = new THREE.CanvasTexture(artwork.canvas);
		value.colorSpace = THREE.SRGBColorSpace;
		value.anisotropy = 8;
		const aspect = artwork.canvas.width / artwork.canvas.height;
		if (aspect > 1) {
			const visibleWidth = 1 / aspect;
			value.repeat.set(visibleWidth, 1);
			value.offset.set((1 - visibleWidth) / 2, 0);
		} else {
			const visibleHeight = aspect;
			value.repeat.set(1, visibleHeight);
			value.offset.set(0, (1 - visibleHeight) / 2);
		}
		return value;
	}, [artwork]);
	useEffect(() => {
		(
			reflection.material as THREE.ShaderMaterial
		).uniforms.reflectionStrength.value = gloss / 100;
	}, [reflection, gloss]);
	useEffect(
		() => () => {
			geometry.dispose();
			patternGeometry.dispose();
			reflection.geometry.dispose();
			reflection.dispose();
			texture?.dispose();
		},
		[geometry, patternGeometry, reflection, texture],
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
			{texture && (
				<mesh
					receiveShadow
					geometry={patternGeometry}
					position={[x, bottom + 0.006 + depth + 0.002, 0]}
					rotation={[-Math.PI / 2, 0, 0]}
					renderOrder={1}
				>
					<meshStandardMaterial
						map={texture}
						transparent
						alphaTest={0.08}
						side={THREE.DoubleSide}
						roughness={0.72}
						metalness={0}
					/>
				</mesh>
			)}
		</group>
	);
}
