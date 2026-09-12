import { useCallback, useRef, useState } from "react";
import type * as THREE from "three";
import type {
	StudioHandle,
	StudioView,
	ViewPose,
} from "@/features/studio/components/StudioViewport";

// The viewport plumbing every product workspace repeats: refs into the canvas,
// viewport readiness, the camera-view command, and a read-back of wherever the
// camera currently sits.
export function useWorkspaceViewport() {
	const framingRef = useRef<HTMLElement | null>(null);
	const backgroundRef = useRef<THREE.Group | null>(null);
	const apiRef = useRef<StudioHandle | null>(null);
	const [ready, setReady] = useState(false);

	const onViewportReady = useCallback(() => setReady(true), []);
	const changeView = useCallback((view: StudioView) => {
		apiRef.current?.view(view);
	}, []);
	const readPose = useCallback((): ViewPose | null => {
		return apiRef.current?.pose() ?? null;
	}, []);

	return {
		framingRef,
		backgroundRef,
		apiRef,
		ready,
		onViewportReady,
		changeView,
		readPose,
	};
}
