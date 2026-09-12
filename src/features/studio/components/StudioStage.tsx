import { sampledDiffuseLighting } from "@/features/studio/lib/indirect-light";
import { AMBIENT_IBL_SHARE } from "@/tuning";
import { useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import type { SceneKind } from "@/tuning";
import { SceneStage } from "@/features/studio/lib/stage";

// The set's own lit surfaces were tuned against the split products used before
// the two lighting passes were balanced, so they keep it.
const stageAmbientShare = { value: AMBIENT_IBL_SHARE };

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

	useEffect(() => {
		const root = setRef.current;
		if (!root) return;
		const stage = new SceneStage();
		stage.configure(kind);
		// Only the scenes that keep a lit surface need the diffuse pass rebalanced.
		if (directLighting)
			stage.group.traverse((object) => {
				if (
					object instanceof THREE.Mesh &&
					object.material instanceof THREE.MeshStandardMaterial
				)
					object.material.onBeforeCompile = (shader) =>
						sampledDiffuseLighting(shader, stageAmbientShare);
			});
		scene.background = stage.background;
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
		</group>
	);
}
