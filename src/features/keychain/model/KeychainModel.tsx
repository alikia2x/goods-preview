import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";
import {
	acrylicGeometry,
	type Outline,
} from "@/features/keychain/lib/geometry";
import type { KeychainSettings } from "@/features/keychain/settings";
import { KeychainHardware } from "@/features/keychain/model/KeychainHardware";

export function KeychainModel({
	artwork,
	outline,
	settings,
}: {
	artwork: KeychainArtwork;
	outline: Outline;
	settings: KeychainSettings;
}) {
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
	return (
		<group position={[0, -1 - bottom * scale, 0]} scale={scale}>
			<mesh geometry={geometry} dispose={null}>
				<meshPhysicalMaterial
					color="#ffffff"
					transmission={1}
					thickness={thickness}
					ior={1.49}
					roughness={0.012 + (1 - settings.gloss / 100) ** 2 * 0.12}
					metalness={0}
					clearcoat={0}
					attenuationColor="#ffffff"
					attenuationDistance={10}
				/>
			</mesh>
			<mesh castShadow receiveShadow customDepthMaterial={depth}>
				<planeGeometry args={[outline.width, outline.height]} />
				<meshStandardMaterial
					map={texture}
					alphaTest={0.08}
					side={THREE.DoubleSide}
					roughness={0.9}
					metalness={0}
				/>
			</mesh>
			<KeychainHardware
				hole={outline.hole}
				kind={settings.hardware}
				thickness={thickness}
				color={settings.hardwareColor}
			/>
		</group>
	);
}
