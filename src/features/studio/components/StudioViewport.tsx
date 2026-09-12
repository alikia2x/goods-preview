import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { captureSquare } from "@/features/studio/lib/capture";
import { applyLiveFraming } from "@/features/studio/lib/framing";

export type StudioView = "front" | "angle" | "back";

export type ViewPose = {
	position: [number, number, number];
	target: [number, number, number];
};

export type StudioViews = Record<StudioView, ViewPose>;

export type StudioHandle = {
	capture: (edge: number, transparent: boolean) => Promise<Blob>;
	view: (view: StudioView) => void;
	// Where the camera is now, so dev tooling can read back a tuned seat.
	pose: () => ViewPose;
};

// The one camera/controls implementation. Products supply only their poses and
// distance limits, so framing, orbiting, the view presets and the square capture
// behave identically everywhere.
export function StudioViewport({
	framingRef,
	backgroundObjects,
	apiRef,
	onViewportReady,
	pose,
	poseKey,
	views,
	minDistance,
	maxDistance,
}: {
	framingRef: RefObject<HTMLElement | null>;
	backgroundObjects: () => THREE.Object3D[];
	apiRef: RefObject<StudioHandle | null>;
	onViewportReady: () => void;
	pose: ViewPose;
	poseKey: unknown;
	views: StudioViews;
	minDistance: number;
	maxDistance: number;
}) {
	const { camera, gl, scene, size } = useThree();
	const orbit = useRef<OrbitControls | null>(null);
	const moveRef = useRef<((next: ViewPose) => void) | null>(null);
	const poseRef = useRef(pose);
	poseRef.current = pose;
	const viewsRef = useRef(views);
	viewsRef.current = views;
	const backgroundObjectsRef = useRef(backgroundObjects);
	backgroundObjectsRef.current = backgroundObjects;

	useEffect(() => {
		if (!(camera instanceof THREE.PerspectiveCamera)) return;
		const controls = new OrbitControls(camera, gl.domElement);
		orbit.current = controls;
		controls.enableDamping = true;
		const move = (next: ViewPose) => {
			// Consume pending damping before jumping the camera.
			controls.enableDamping = false;
			controls.target.set(...next.target);
			camera.position.set(...next.position);
			controls.update();
			controls.enableDamping = true;
		};
		moveRef.current = move;
		move(poseRef.current);
		apiRef.current = {
			capture: async (edge, transparent) => {
				if (!framingRef.current) throw new Error("预览尚未就绪。");
				return captureSquare({
					context: {
						renderer: gl,
						scene,
						camera,
						framing: framingRef.current,
					},
					output: { edge, transparent },
					backgroundObjects: backgroundObjectsRef.current(),
				});
			},
			view: (view) => move(viewsRef.current[view]),
			pose: () => ({
				position: [camera.position.x, camera.position.y, camera.position.z],
				target: [controls.target.x, controls.target.y, controls.target.z],
			}),
		};
		onViewportReady();
		return () => {
			controls.dispose();
			orbit.current = null;
			moveRef.current = null;
			apiRef.current = null;
		};
	}, [camera, gl, scene, apiRef, framingRef, onViewportReady]);

	useEffect(() => {
		const controls = orbit.current;
		if (!controls) return;
		controls.minDistance = minDistance;
		controls.maxDistance = maxDistance;
		controls.update();
	}, [minDistance, maxDistance]);

	useEffect(() => {
		// Products decide which measured changes should re-seat the camera. Keeping
		// this separate from the controls lifecycle preserves one continuous orbit
		// session while still applying the latest pose after measurement settles.
		void poseKey;
		moveRef.current?.(poseRef.current);
	}, [poseKey]);

	useEffect(() => {
		const framing = framingRef.current;
		if (!framing || !(camera instanceof THREE.PerspectiveCamera)) return;
		const apply = () =>
			applyLiveFraming(
				camera,
				{ width: size.width, height: size.height },
				framing.getBoundingClientRect(),
			);
		apply();
		// The canvas never resizes; the framing box does, so observe it directly.
		const observer = new ResizeObserver(apply);
		observer.observe(framing);
		return () => observer.disconnect();
	}, [camera, size.width, size.height, framingRef]);

	useFrame(() => orbit.current?.update());
	return null;
}
