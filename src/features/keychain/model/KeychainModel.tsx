import { sampledDiffuseLighting } from "@/features/studio/lib/indirect-light";
import { createOpticalShadow } from "@/features/acrylic/optical-shadow";
import { AcrylicMaterial } from "@/features/acrylic/AcrylicMaterial";
import { StandeeBase } from "@/features/acrylic/StandeeBase";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";
import {
	acrylicGeometry,
	type Outline,
} from "@/features/keychain/lib/geometry";
import type { KeychainSettings } from "@/features/keychain/settings";
import { KeychainHardware } from "@/features/keychain/model/KeychainHardware";
import { ambientIblShare } from "@/features/studio/lib/light-budget";

export function KeychainModel({
	artwork,
	outline,
	settings,
}: {
	artwork: KeychainArtwork;
	outline: Outline;
	settings: KeychainSettings;
}) {
	const opticalShadow = useMemo(createOpticalShadow, []);
	useEffect(() => () => opticalShadow.dispose(), [opticalShadow]);
	const thickness = (settings.thickness / settings.size) * 2;
	const geometry = useMemo(
		() => acrylicGeometry(outline, thickness),
		[outline, thickness],
	);
	const texture = useMemo(() => {
		const value = new THREE.CanvasTexture(artwork.canvas);
		value.colorSpace = THREE.SRGBColorSpace;
		value.anisotropy = 8;
		return value;
	}, [artwork]);
	const depth = useMemo(
		() =>
			new THREE.MeshDepthMaterial({
				depthPacking: THREE.RGBADepthPacking,
				map: texture,
				alphaTest: 0.15,
				side: THREE.DoubleSide,
			}),
		[texture],
	);
	useEffect(() => () => geometry.dispose(), [geometry]);
	useEffect(
		() => () => {
			texture.dispose();
			depth.dispose();
		},
		[texture, depth],
	);
	const scale = settings.size / 60;
	const bottom = Math.min(...outline.points.map((point) => point.y));
	// The printed surface is the one the key light also strikes, so it carries the
	// ambient share. Held in a uniform: the scene can change its split without
	// forcing the shader to recompile.
	const ambientShare = useRef({ value: ambientIblShare(settings.scene) });
	useEffect(() => {
		ambientShare.current.value = ambientIblShare(settings.scene);
	}, [settings.scene]);
	const patchDiffuse = useCallback(
		(shader: THREE.WebGLProgramParametersWithUniforms) =>
			sampledDiffuseLighting(shader, ambientShare.current),
		[],
	);
	return (
		<group position={[0, -1 - bottom * scale, 0]} scale={scale}>
			<mesh
				castShadow
				customDepthMaterial={opticalShadow}
				geometry={geometry}
				dispose={null}
			>
				<AcrylicMaterial
					attach="material-0"
					thickness={thickness}
					gloss={settings.gloss}
				/>
				<AcrylicMaterial
					attach="material-1"
					thickness={thickness}
					gloss={settings.gloss}
					edge
				/>
			</mesh>
			<mesh castShadow receiveShadow customDepthMaterial={depth}>
				<planeGeometry args={[outline.width, outline.height]} />
				<meshStandardMaterial
					onBeforeCompile={patchDiffuse}
					map={texture}
					alphaTest={0.08}
					side={THREE.DoubleSide}
					roughness={0.9}
					metalness={0}
				/>
			</mesh>
			{settings.productKind === "standee" && (
				<StandeeBase
					settings={settings}
					bottom={bottom}
					x={outline.connector?.x ?? 0}
					width={
						outline.connector?.width ??
						(settings.connectorWidth / settings.size) * 2
					}
				/>
			)}
			{settings.productKind === "keychain" && (
				<KeychainHardware
					hole={outline.hole}
					kind={settings.hardware}
					thickness={thickness}
					color={settings.hardwareColor}
				/>
			)}
		</group>
	);
}
