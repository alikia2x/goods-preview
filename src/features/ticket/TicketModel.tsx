import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { ticketMaterial } from "@/features/ticket/material";
import type { TicketSettings } from "@/features/ticket/settings";
import type { Frame } from "@/features/studio/lib/framing";
import { STAGE_FLOOR_Y } from "@/tuning";

export function TicketModel({
	artwork,
	settings,
	onPlaced,
}: {
	artwork: HTMLImageElement | HTMLCanvasElement;
	settings: TicketSettings;
	onPlaced: (frame: Frame) => void;
}) {
	const longest = Math.max(artwork.width, artwork.height);
	const width = ((settings.size / 30) * artwork.width) / longest;
	const height = ((settings.size / 30) * artwork.height) / longest;
	const texture = useMemo(() => {
		const canvas = document.createElement("canvas");
		canvas.width = artwork.width;
		canvas.height = artwork.height;
		const context = canvas.getContext("2d");
		if (!context) throw new Error("无法创建票面图案。");
		context.drawImage(artwork, 0, 0);
		const texture = new THREE.CanvasTexture(canvas);
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = 8;
		return texture;
	}, [artwork]);
	const material = useMemo(
		() => ticketMaterial(texture, settings.finish, settings.gloss),
		[texture, settings.finish, settings.gloss],
	);
	useEffect(() => () => texture.dispose(), [texture]);
	useEffect(() => () => material.dispose(), [material]);
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
				0,
			]}
		>
			<mesh castShadow receiveShadow>
				<boxGeometry args={[width, height, 0.012]} />
				<meshStandardMaterial color="#f5f4ef" roughness={0.65} />
			</mesh>
			<mesh position={[0, 0, 0.0065]} receiveShadow material={material}>
				<planeGeometry args={[width, height]} />
			</mesh>
		</group>
	);
}
