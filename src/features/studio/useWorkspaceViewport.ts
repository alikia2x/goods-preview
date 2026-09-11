import { useCallback, useRef, useState } from "react";
import type * as THREE from "three";
import type {
	StudioHandle,
	StudioView,
} from "@/features/studio/components/StudioViewport";

// The viewport plumbing every product workspace repeats: refs into the canvas,
// viewport readiness and the camera-view command.
export function useWorkspaceViewport() {
	const framingRef = useRef<HTMLElement | null>(null);
	const backgroundRef = useRef<THREE.Group | null>(null);
	const apiRef = useRef<StudioHandle | null>(null);
	const [ready, setReady] = useState(false);

	const onViewportReady = useCallback(() => setReady(true), []);
	const changeView = useCallback((view: StudioView) => {
		apiRef.current?.view(view);
	}, []);

	return {
		framingRef,
		backgroundRef,
		apiRef,
		ready,
		onViewportReady,
		changeView,
	};
}
