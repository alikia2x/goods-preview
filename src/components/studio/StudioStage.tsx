import { useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import { SCENES, type SceneKind, sceneWallZ } from "@/lib/studio/scenes";
import { SceneStage } from "@/lib/studio/stage";

export function StudioStage({
	kind,
	shadow,
	backgroundRef,
}: {
	kind: SceneKind;
	shadow: number;
	backgroundRef: RefObject<THREE.Group | null>;
}) {
	const scene = useThree((state) => state.scene);
	const setRef = useRef<THREE.Group | null>(null);
	useEffect(() => {
		scene.background = new THREE.Color(SCENES[kind].background);
	}, [scene, kind]);
	useEffect(() => {
		const root = setRef.current;
		if (!root) return;
		const stage = new SceneStage();
		stage.configure(kind, 1);
		stage.casters.traverse((object) => {
			if (object instanceof THREE.Mesh) {
				object.castShadow = true;
				object.material.colorWrite = false;
				object.material.depthWrite = false;
			}
		});
		root.add(stage.group, stage.casters);
		return () => {
			root.remove(stage.group, stage.casters);
			stage.dispose();
		};
	}, [kind]);
	const wall = kind === "studio";
	const wallZ = sceneWallZ(kind);
	return (
		<>
			<group ref={backgroundRef}>
				<group ref={setRef} />
				{kind === "plain" && (
					<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.004, 0]}>
						<planeGeometry args={[200, 200]} />
						<meshStandardMaterial
							color={SCENES[kind].background}
							roughness={0.9}
						/>
					</mesh>
				)}
			</group>
			{!wall && (
				<mesh
					receiveShadow
					position={[0, -0.999, 0]}
					rotation={[-Math.PI / 2, 0, 0]}
				>
					<planeGeometry args={[200, 200]} />
					<shadowMaterial
						transparent
						opacity={shadow / 100}
						depthWrite={false}
					/>
				</mesh>
			)}
			{wallZ !== null && (
				<mesh receiveShadow position={[0, 0, wallZ + 0.003]}>
					<planeGeometry args={[200, 200]} />
					<shadowMaterial
						transparent
						opacity={shadow / 100}
						depthWrite={false}
					/>
				</mesh>
			)}
		</>
	);
}
