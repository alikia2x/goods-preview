import { useEffect, useMemo } from "react";
import type { Vector2 } from "three";
import {
	claspBodyGeometry,
	claspGateGeometry,
	ovalLinkGeometry,
	splitRingGeometry,
} from "@/features/keychain/lib/hardware";
import { KEYCHAIN_HARDWARE_COLORS } from "@/features/keychain/lib/materials";
import type { KeychainHardwareColor } from "@/features/keychain/settings";

export function KeychainHardware({
	hole,
	kind,
	thickness,
	color,
}: {
	hole: Vector2;
	kind: "ring" | "clasp";
	thickness: number;
	color: KeychainHardwareColor;
}) {
	const geometries = useMemo(
		() => ({
			link: ovalLinkGeometry(),
			jump: ovalLinkGeometry(Math.max(0.075, thickness / 2 + 0.026)),
			ring: splitRingGeometry(),
			body: claspBodyGeometry(),
			gate: claspGateGeometry(),
		}),
		[thickness],
	);
	useEffect(
		() => () => {
			for (const geometry of Object.values(geometries)) geometry.dispose();
		},
		[geometries],
	);
	const material = KEYCHAIN_HARDWARE_COLORS[color];
	const polished = {
		color: material.color,
		metalness: 1,
		roughness: material.roughness,
		envMapIntensity: material.environmentIntensity,
	};
	return (
		<group position={[hole.x, hole.y, 0]}>
			{[0, 1, 2, 3].map((index) => (
				<mesh
					key={index}
					geometry={index ? geometries.link : geometries.jump}
					position={[0, 0.045 + index * 0.167, 0]}
					rotation={[0, index % 2 ? 0.08 : Math.PI / 2, 0.035]}
					castShadow
					receiveShadow
				>
					<meshStandardMaterial {...polished} />
				</mesh>
			))}
			{kind === "ring" ? (
				<mesh
					geometry={geometries.ring}
					position={[0, 1.075, 0]}
					rotation={[0, 0.08, -0.2]}
					castShadow
					receiveShadow
				>
					<meshStandardMaterial {...polished} />
				</mesh>
			) : (
				<group position={[0, 1.02, 0]} rotation={[0, 0.08, 0]}>
					<mesh geometry={geometries.body} castShadow receiveShadow>
						<meshStandardMaterial {...polished} />
					</mesh>
					<mesh geometry={geometries.gate} castShadow receiveShadow>
						<meshStandardMaterial {...polished} />
					</mesh>
					<mesh
						position={[0.035, -0.245, 0]}
						rotation={[Math.PI / 2, 0, 0]}
						castShadow
					>
						<cylinderGeometry args={[0.024, 0.024, 0.062, 24]} />
						<meshStandardMaterial {...polished} />
					</mesh>
					<mesh position={[0.11, -0.2, 0]} rotation={[0, 0, -0.45]} castShadow>
						<capsuleGeometry args={[0.023, 0.07, 6, 16]} />
						<meshStandardMaterial {...polished} />
					</mesh>
					<mesh position={[0, -0.36, 0]} castShadow receiveShadow>
						<torusGeometry args={[0.064, 0.023, 16, 48]} />
						<meshStandardMaterial {...polished} />
					</mesh>
				</group>
			)}
		</group>
	);
}
