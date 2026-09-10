import { Canvas } from "@react-three/fiber";
import { useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
	KeychainControls,
	KeychainSize,
} from "@/components/keychain/KeychainControls";
import { KeychainModel } from "@/components/keychain/KeychainModel";
import { DebugCollector, DebugPanel } from "@/components/studio/DebugPanel";
import { PreviewErrorBoundary } from "@/components/studio/PreviewErrorBoundary";
import {
	EnvironmentLoader,
	STUDIO_RENDERING,
	StudioLighting,
} from "@/components/studio/StudioLighting";
import { StudioStage } from "@/components/studio/StudioStage";
import { StudioViewport } from "@/components/studio/StudioViewport";
import { PreviewToolbar } from "@/components/workspace/PreviewToolbar";
import { ProductMenu } from "@/components/workspace/ProductMenu";
import { useKeychainWorkspace } from "@/hooks/useKeychainWorkspace";
import { useMobile } from "@/hooks/useMobile";
import { PRODUCT_VERSION } from "@/lib/badge/constants";
import { keychainFrame } from "@/lib/keychain/geometry";
import type { LightingPreset } from "@/lib/studio/lighting-presets";

export default function KeychainWorkspace() {
	const workspace = useKeychainWorkspace(),
		mobile = useMobile();
	const backgroundRef = useRef<THREE.Group | null>(null);
	const [environments, setEnvironments] = useState<
		Partial<Record<LightingPreset, THREE.WebGLRenderTarget>>
	>({});
	const [environmentError, setEnvironmentError] = useState(false);
	const onEnvironment = useCallback(
		(preset: LightingPreset, target: THREE.WebGLRenderTarget) => {
			setEnvironments((current) => ({ ...current, [preset]: target }));
			setEnvironmentError(false);
		},
		[],
	);
	const onEnvironmentError = useCallback(() => {
		setEnvironmentError(true);
	}, []);
	const environment = environments[workspace.settings.lighting] ?? null;
	const frame = useMemo(
		() =>
			workspace.model
				? keychainFrame(
						workspace.model.outline,
						workspace.settings.size,
						workspace.settings.hardware,
					)
				: { center: [0, 0.6, 0] as [number, number, number], span: 3.6 },
		[workspace.model, workspace.settings.size, workspace.settings.hardware],
	);
	return (
		<main className="workspace">
			<div className="canvas-host">
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
						fallback={
							<div className="canvas-status" role="alert">
								浏览器不支持 WebGL 2。
							</div>
						}
					>
						<EnvironmentLoader
							preset={workspace.settings.lighting}
							onReady={onEnvironment}
							onError={onEnvironmentError}
						/>
						<StudioViewport
							frame={frame}
							framingRef={workspace.framingRef}
							apiRef={workspace.apiRef}
							backgroundRef={backgroundRef}
							onReady={workspace.onReady}
						/>
						<StudioLighting
							environment={environment}
							preset={workspace.settings.lighting}
							intensity={workspace.settings.light}
							azimuth={workspace.settings.lightAzimuth}
							elevation={workspace.settings.lightElevation}
							scene={workspace.settings.scene}
						/>
						<StudioStage
							kind={workspace.settings.scene}
							shadow={workspace.settings.shadow}
							backgroundRef={backgroundRef}
						/>
						{workspace.model && (
							<KeychainModel
								{...workspace.model}
								settings={workspace.settings}
							/>
						)}
						{import.meta.env.DEV && <DebugCollector />}
					</Canvas>
				</PreviewErrorBoundary>
			</div>
			<section
				className="preview"
				ref={workspace.framingRef}
				aria-label="钥匙扣预览工作区"
			>
				{environmentError && (
					<div className="canvas-status" role="alert">
						光照资源加载失败，反射效果已降级。
					</div>
				)}
				{!environmentError && !environment && workspace.model && (
					<div className="canvas-status" role="status">
						正在准备光照…
					</div>
				)}
				<header className="preview-header">
					<div className="header-group">
						<ProductMenu product="keychain" />
						<span className="pill product-name">亚克力钥匙扣</span>
					</div>
					{mobile ? (
						<KeychainSize workspace={workspace} />
					) : (
						<span className="pill brand">
							Goods Preview <span>{PRODUCT_VERSION}</span>
						</span>
					)}
				</header>
				{!mobile && (
					<PreviewToolbar
						onViewChange={(view) => workspace.apiRef.current?.view(view)}
					>
						<KeychainSize workspace={workspace} />
					</PreviewToolbar>
				)}
			</section>
			<KeychainControls workspace={workspace} />
			{import.meta.env.DEV && <DebugPanel />}
		</main>
	);
}
