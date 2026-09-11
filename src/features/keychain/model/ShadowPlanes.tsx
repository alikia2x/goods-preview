import type { SceneKind } from "@/features/studio/lib/scenes";
import { sceneWallZ } from "@/features/studio/lib/scenes";

// The keychain casts through alpha-tested geometry, so it uses the renderer's
// native shadow maps received by these matte planes rather than a depth pass.
export function ShadowPlanes({
	kind,
	shadow,
}: {
	kind: SceneKind;
	shadow: number;
}) {
	const wall = kind === "studio";
	const wallZ = sceneWallZ(kind);
	const opacity = shadow / 100;
	return (
		<>
			{!wall && (
				<mesh
					receiveShadow
					position={[0, -0.999, 0]}
					rotation={[-Math.PI / 2, 0, 0]}
				>
					<planeGeometry args={[200, 200]} />
					<shadowMaterial transparent opacity={opacity} depthWrite={false} />
				</mesh>
			)}
			{wallZ !== null && (
				<mesh receiveShadow position={[0, 0, wallZ + 0.003]}>
					<planeGeometry args={[200, 200]} />
					<shadowMaterial transparent opacity={opacity} depthWrite={false} />
				</mesh>
			)}
		</>
	);
}
