import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { captureSquare } from "@/lib/studio/capture";
import { squareCrop } from "@/lib/studio/framing";

export type StudioHandle = {
	capture: (edge: number, transparent: boolean) => Promise<Blob>;
	view: (view: "front" | "angle" | "back") => void;
};

export function StudioViewport({
	framingRef,
	backgroundRef,
	apiRef,
	onReady,
	frame,
}: {
	framingRef: RefObject<HTMLElement | null>;
	backgroundRef: RefObject<THREE.Group | null>;
	apiRef: RefObject<StudioHandle | null>;
	onReady: () => void;
	frame: { center: [number, number, number]; span: number };
}) {
	const { camera, gl, scene, size } = useThree();
	const orbit = useRef<OrbitControls | null>(null);
	useEffect(() => {
		if (!(camera instanceof THREE.PerspectiveCamera)) return;
		const controls = new OrbitControls(camera, gl.domElement);
		orbit.current = controls;
		controls.enableDamping = true;
		controls.minDistance = 3;
		controls.maxDistance = 12;
		const distance =
			(frame.span / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) *
			1.18;
		const target = new THREE.Vector3(...frame.center);
		controls.target.copy(target);
		camera.position
			.copy(target)
			.add(
				new THREE.Vector3(0.07, 0.05, 1).normalize().multiplyScalar(distance),
			);
		controls.update();
		apiRef.current = {
			capture: async (edge, transparent) => {
				if (!framingRef.current) throw new Error("预览尚未就绪。");
				return captureSquare({
					renderer: gl,
					scene,
					camera,
					framing: framingRef.current,
					edge,
					transparent,
					backgroundObjects: backgroundRef.current
						? [backgroundRef.current]
						: [],
				});
			},
			view: (view) => {
				controls.enableDamping = false;
				controls.update();
				controls.target.copy(target);
				const direction =
					view === "back"
						? new THREE.Vector3(0, 0.03, -1)
						: view === "front"
							? new THREE.Vector3(0, 0, 1)
							: new THREE.Vector3(0.25, 0.1, 1);
				camera.position
					.copy(target)
					.add(direction.normalize().multiplyScalar(distance));
				controls.update();
				controls.enableDamping = true;
			},
		};
		onReady();
		return () => {
			controls.dispose();
			orbit.current = null;
			apiRef.current = null;
		};
	}, [camera, gl, scene, apiRef, framingRef, backgroundRef, onReady, frame]);
	useEffect(() => {
		if (!(camera instanceof THREE.PerspectiveCamera) || !framingRef.current)
			return;
		const crop = squareCrop(framingRef.current.getBoundingClientRect());
		camera.setViewOffset(
			size.width,
			size.height,
			size.width / 2 - (crop.left + crop.width / 2),
			size.height / 2 - (crop.top + crop.height / 2),
			size.width,
			size.height,
		);
		camera.zoom =
			Math.min(1, crop.height / size.height) * (size.width <= 700 ? 0.88 : 1);
		camera.updateProjectionMatrix();
	}, [camera, size.width, size.height, framingRef]);
	useFrame(() => orbit.current?.update());
	return null;
}
