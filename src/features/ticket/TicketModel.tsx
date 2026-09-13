import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { composeTicketTexture } from "@/features/ticket/lib/artwork";
import { ticketMaterial } from "@/features/ticket/material";
import type { TicketSettings } from "@/features/ticket/settings";
import type { Frame } from "@/features/studio/lib/framing";
import { STAGE_FLOOR_Y } from "@/tuning";

export function TicketModel({
	artwork,
	backArtwork,
	settings,
	onPlaced,
}: {
	artwork: HTMLImageElement | HTMLCanvasElement;
	backArtwork: HTMLImageElement | HTMLCanvasElement | null;
	settings: TicketSettings;
	onPlaced: (frame: Frame) => void;
}) {
	const longest = Math.max(artwork.width, artwork.height);
	const width = ((settings.size / 30) * artwork.width) / longest;
	const height = ((settings.size / 30) * artwork.height) / longest;
	const texture = useMemo(() => {
		const texture = new THREE.CanvasTexture(
			composeTicketTexture(artwork, settings.bleed, settings.size),
		);
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = 8;
		return texture;
	}, [artwork, settings.bleed, settings.size]);
	const backTexture = useMemo(() => {
		if (!backArtwork) return null;
		const texture = new THREE.CanvasTexture(
			composeTicketTexture(backArtwork, settings.bleed, settings.size),
		);
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = 8;
		return texture;
	}, [backArtwork, settings.bleed, settings.size]);
	const material = useMemo(
		() => ticketMaterial(texture, settings.finish, settings.gloss),
		[texture, settings.finish, settings.gloss],
	);
	const backMaterial = useMemo(
		() =>
			backTexture
				? ticketMaterial(backTexture, settings.finish, settings.gloss)
				: null,
		[backTexture, settings.finish, settings.gloss],
	);
	useEffect(() => () => texture.dispose(), [texture]);
	useEffect(() => () => backTexture?.dispose(), [backTexture]);
	useEffect(() => () => material.dispose(), [material]);
	useEffect(() => () => backMaterial?.dispose(), [backMaterial]);
	const depthOffset =
		settings.scene === "standing" ? settings.positionOffsetZ / 30 : 0;
	useLayoutEffect(() => {
		onPlaced({
			center: [
				0,
				STAGE_FLOOR_Y + (settings.pose === "flat" ? 0.006 : height / 2),
				0,
			],
			span: Math.max(width, height) + 0.15,
		});
	}, [width, height, settings.pose, onPlaced]);
	return (
		<group
			rotation={[settings.pose === "flat" ? -Math.PI / 2 : 0, 0, 0]}
			position={[
				0,
				STAGE_FLOOR_Y + (settings.pose === "flat" ? 0.006 : height / 2),
				depthOffset,
			]}
		>
			<mesh castShadow receiveShadow>
				<boxGeometry args={[width, height, 0.012]} />
				<meshStandardMaterial color="#f5f4ef" roughness={0.65} />
			</mesh>
			<mesh position={[0, 0, 0.0065]} receiveShadow material={material}>
				<planeGeometry args={[width, height]} />
			</mesh>
			{backMaterial && (
				<mesh
					position={[0, 0, -0.0065]}
					rotation={[0, Math.PI, 0]}
					receiveShadow
					material={backMaterial}
				>
					<planeGeometry args={[width, height]} />
				</mesh>
			)}
		</group>
	);
}
