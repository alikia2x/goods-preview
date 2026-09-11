import { Canvas } from "@react-three/fiber";
import type { ReactNode, RefObject } from "react";
import * as THREE from "three";
import { DebugCollector } from "@/features/studio/components/DebugPanel";
import { PreviewErrorBoundary } from "@/features/studio/components/PreviewErrorBoundary";
import {
	EnvironmentLoader,
	STUDIO_RENDERING,
	StudioLighting,
} from "@/features/studio/components/StudioLighting";
import { StudioStage } from "@/features/studio/components/StudioStage";
import {
	StudioViewport,
	type StudioHandle,
	type StudioViews,
	type ViewPose,
} from "@/features/studio/components/StudioViewport";
import type { LightingPreset } from "@/features/studio/lib/lighting-presets";
import type { StudioSettings } from "@/features/studio/settings";

// The single canvas pipeline: environments, camera, lighting, stage and the
// product model. Both workspaces mount exactly this, differing only in props.
export function StudioCanvas({
	settings,
	environment,
	onEnvironmentReady,
	onEnvironmentError,
	framingRef,
	backgroundRef,
	backgroundObjects,
	apiRef,
	onViewportReady,
	pose,
	poseKey,
	views,
	minDistance,
	maxDistance,
	sceneObjects,
	children,
}: {
	settings: StudioSettings;
	environment: THREE.WebGLRenderTarget | null;
	onEnvironmentReady: (
		preset: LightingPreset,
		target: THREE.WebGLRenderTarget,
	) => void;
	onEnvironmentError: (preset: LightingPreset) => void;
	framingRef: RefObject<HTMLElement | null>;
	backgroundRef: RefObject<THREE.Group | null>;
	backgroundObjects: () => THREE.Object3D[];
	apiRef: RefObject<StudioHandle | null>;
	onViewportReady: () => void;
	pose: ViewPose;
	poseKey: unknown;
	views: StudioViews;
	minDistance: number;
	maxDistance: number;
	sceneObjects?: ReactNode;
	children: ReactNode;
}) {
	return (
		<PreviewErrorBoundary>
			<Canvas
				shadows={{ type: THREE.PCFShadowMap }}
				dpr={[1, 2]}
				camera={{ fov: 35, near: 0.1, far: 200 }}
				gl={{
					antialias: true,
					alpha: true,
					preserveDrawingBuffer: true,
					...STUDIO_RENDERING,
				}}
				className="block touch-none"
				fallback={
					<div
						className="absolute top-1/2 w-full text-center text-status-muted"
						role="alert"
					>
						浏览器不支持 WebGL 2。
					</div>
				}
			>
				<EnvironmentLoader
					preset={settings.lighting}
					onEnvironmentReady={onEnvironmentReady}
					onError={onEnvironmentError}
				/>
				<StudioViewport
					framingRef={framingRef}
					backgroundObjects={backgroundObjects}
					apiRef={apiRef}
					onViewportReady={onViewportReady}
					pose={pose}
					poseKey={poseKey}
					views={views}
					minDistance={minDistance}
					maxDistance={maxDistance}
				/>
				<StudioLighting
					environment={environment}
					preset={settings.lighting}
					intensity={settings.light}
					azimuth={settings.lightAzimuth}
					elevation={settings.lightElevation}
					scene={settings.scene}
				/>
				<StudioStage kind={settings.scene} backgroundRef={backgroundRef} />
				{sceneObjects}
				{children}
				{import.meta.env.DEV && <DebugCollector />}
			</Canvas>
		</PreviewErrorBoundary>
	);
}
