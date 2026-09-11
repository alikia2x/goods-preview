import {
	neutralFloor,
	tabletopLighting,
} from "@/features/studio/lib/floor-material";
import { sampledDiffuseLighting } from "@/features/studio/lib/indirect-light";
import { useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SceneKind } from "@/features/studio/lib/scenes";
import { SceneStage } from "@/features/studio/lib/stage";

// The shared set geometry, owned by the studio. Products add their own shadow
// receivers and key lights alongside it.
export function StudioStage({
	kind,
	backgroundRef,
	directLighting = false,
}: {
	kind: SceneKind;
	directLighting?: boolean;
	backgroundRef: RefObject<THREE.Group | null>;
}) {
	const scene = useThree((state) => state.scene);
	const setRef = useRef<THREE.Group | null>(null);
	const [background, setBackground] = useState<THREE.Color | null>(null);

	useEffect(() => {
		const root = setRef.current;
		if (!root) return;
		const stage = new SceneStage();
		stage.configure(kind, 1);
		if (directLighting)
			stage.group.traverse((object) => {
				if (
					object instanceof THREE.Mesh &&
					object.material instanceof THREE.MeshStandardMaterial
				)
					object.material.onBeforeCompile =
						kind === "table" ? tabletopLighting : sampledDiffuseLighting;
			});
		scene.background = stage.background;
		setBackground(stage.background);
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
	}, [kind, scene, directLighting]);

	return (
		<group ref={backgroundRef}>
			<group ref={setRef} />
			{kind === "plain" && background && (
				<mesh
					receiveShadow
					rotation={[-Math.PI / 2, 0, 0]}
					position={[0, -1.004, 0]}
				>
					<planeGeometry args={[200, 200]} />
					<shadowMaterial
						color={background}
						transparent={false}
						toneMapped={false}
						onBeforeCompile={neutralFloor}
					/>
				</mesh>
			)}
		</group>
	);
}
