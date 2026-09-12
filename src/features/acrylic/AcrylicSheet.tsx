import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { AcrylicMaterial } from "@/features/acrylic/AcrylicMaterial";
import {
	type Outline,
	acrylicGeometry,
	sheetThickness,
} from "@/features/acrylic/lib/geometry";
import { createOpticalShadow } from "@/features/acrylic/optical-shadow";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";
import { sampledDiffuseLighting } from "@/features/studio/lib/indirect-light";
import { ambientIblShare } from "@/features/studio/lib/light-budget";
import { MODEL_SCALE, STAGE_FLOOR_Y, type SceneKind } from "@/tuning";

// The cut sheet and the artwork printed behind it. Every acrylic product is this
// plus its own parts, which arrive as children and are seated with it.
export function AcrylicSheet({
	artwork,
	outline,
	size,
	thickness,
	gloss,
	scene,
	children,
}: {
	artwork: KeychainArtwork;
	outline: Outline;
	size: number;
	thickness: number;
	gloss: number;
	scene: SceneKind;
	children?: ReactNode;
}) {
	const scale = size / MODEL_SCALE.sheet;
	const depth = sheetThickness(thickness, size);
	const opticalShadow = useMemo(createOpticalShadow, []);
	useEffect(() => () => opticalShadow.dispose(), [opticalShadow]);
	const geometry = useMemo(
		() => acrylicGeometry(outline, depth),
		[outline, depth],
	);
	const texture = useMemo(() => {
		const value = new THREE.CanvasTexture(artwork.canvas);
		value.colorSpace = THREE.SRGBColorSpace;
		value.anisotropy = 8;
		return value;
	}, [artwork]);
	const depthMaterial = useMemo(
		() =>
			new THREE.MeshDepthMaterial({
				depthPacking: THREE.RGBADepthPacking,
				map: texture,
				alphaTest: 0.15,
				alphaToCoverage: true,
				side: THREE.DoubleSide,
			}),
		[texture],
	);
	useEffect(() => () => geometry.dispose(), [geometry]);
	useEffect(
		() => () => {
			texture.dispose();
			depthMaterial.dispose();
		},
		[texture, depthMaterial],
	);
	// The printed surface is the one the key light also strikes, so it carries the
	// ambient share. Held in a uniform: the scene can change its split without
	// forcing the shader to recompile.
	const ambientShare = useRef({ value: ambientIblShare(scene) });
	useEffect(() => {
		ambientShare.current.value = ambientIblShare(scene);
	}, [scene]);
	const patchDiffuse = useCallback(
		(shader: THREE.WebGLProgramParametersWithUniforms) =>
			sampledDiffuseLighting(shader, ambientShare.current),
		[],
	);
	const bottom = Math.min(...outline.points.map((point) => point.y));
	return (
		<group position={[0, STAGE_FLOOR_Y - bottom * scale, 0]} scale={scale}>
			<mesh
				castShadow
				customDepthMaterial={opticalShadow}
				geometry={geometry}
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
			<mesh castShadow receiveShadow customDepthMaterial={depthMaterial}>
				<planeGeometry args={[outline.width, outline.height]} />
				<meshStandardMaterial
					onBeforeCompile={patchDiffuse}
					map={texture}
					alphaTest={0.08}
					alphaToCoverage
					side={THREE.DoubleSide}
					roughness={0.9}
					metalness={0}
				/>
			</mesh>
			{children}
		</group>
	);
}
