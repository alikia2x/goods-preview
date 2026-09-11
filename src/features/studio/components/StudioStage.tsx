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
}: {
	kind: SceneKind;
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
	}, [kind, scene]);

	return (
		<group ref={backgroundRef}>
			<group ref={setRef} />
			{kind === "plain" && background && (
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.004, 0]}>
					<planeGeometry args={[200, 200]} />
					<meshStandardMaterial color={background} roughness={0.9} />
				</mesh>
			)}
		</group>
	);
}
