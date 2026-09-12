import { Canvas } from "@react-three/fiber";
import { type ReactNode, type RefObject, useState } from "react";
import * as THREE from "three";
import { AdaptiveResolution } from "@/features/studio/components/AdaptiveResolution";
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
import { openingPixelRatio } from "@/features/studio/lib/adaptive-resolution";
import type { LightingPreset } from "@/features/studio/lib/lighting-presets";
import type { StudioSettings } from "@/features/studio/settings";
import { ADAPTIVE_RESOLUTION, CAMERA } from "@/tuning";

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
	// The opening ratio is the ceiling: adapting only trades detail away. The
	// value lives here rather than in r3f's store because `configure` re-asserts
	// the `dpr` prop on every render of this component.
	const [opening] = useState(() => openingPixelRatio(ADAPTIVE_RESOLUTION));
	const [dpr, setDpr] = useState(opening);
	return (
		<PreviewErrorBoundary>
			<Canvas
				shadows={{ type: THREE.PCFShadowMap }}
				dpr={dpr}
				camera={{ fov: CAMERA.fov, near: CAMERA.near, far: CAMERA.far }}
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
				<AdaptiveResolution opening={opening} onDprChange={setDpr} />
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
				/>
				<StudioStage
					kind={settings.scene}
					backgroundRef={backgroundRef}
					directLighting={Boolean(sceneObjects)}
				/>
				{sceneObjects}
				{children}
				{import.meta.env.DEV && <DebugCollector />}
			</Canvas>
		</PreviewErrorBoundary>
	);
}
