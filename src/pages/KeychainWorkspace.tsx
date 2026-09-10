import { Canvas } from "@react-three/fiber";
import { useCallback, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
	KeychainControls,
	KeychainSize,
} from "@/components/keychain/KeychainControls";
import { KeychainModel } from "@/components/keychain/KeychainModel";
import { KeychainProductControls } from "@/components/keychain/KeychainProductControls";
import { DebugCollector, DebugPanel } from "@/components/studio/DebugPanel";
import { PreviewErrorBoundary } from "@/components/studio/PreviewErrorBoundary";
import {
	EnvironmentLoader,
	STUDIO_RENDERING,
	StudioLighting,
} from "@/components/studio/StudioLighting";
import { StudioStage } from "@/components/studio/StudioStage";
import { StudioViewport } from "@/components/studio/StudioViewport";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PILL_CLASS_NAME } from "@/components/workspace/classNames";
import { PreviewToolbar } from "@/components/workspace/PreviewToolbar";
import { ProductMenu } from "@/components/workspace/ProductMenu";
import { useKeychainWorkspace } from "@/hooks/useKeychainWorkspace";
import { useMobile } from "@/hooks/useMobile";
import { PRODUCT_VERSION } from "@/lib/badge/constants";
import { keychainFrame } from "@/lib/keychain/geometry";
import { KEYCHAIN_HARDWARE_COLORS } from "@/lib/keychain/materials";
import type { LightingPreset } from "@/lib/studio/lighting-presets";
import controlStyles from "@/styles/studio-controls.module.css";
import layoutStyles from "@/styles/workspace.module.css";

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
	const productName = `亚克力钥匙扣 · ${KEYCHAIN_HARDWARE_COLORS[workspace.settings.hardwareColor].label}`;
	return (
		<main
			className={`${layoutStyles.workspace} h-dvh bg-transparent text-[#292929]`}
		>
			<div className={`${layoutStyles.canvasHost} fixed inset-0`}>
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
								className="absolute top-1/2 w-full text-center text-[#777]"
								role="alert"
							>
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
				className={`${layoutStyles.preview} pointer-events-none`}
				ref={workspace.framingRef}
				aria-label="钥匙扣预览工作区"
			>
				{environmentError && (
					<div
						className="absolute top-1/2 w-full text-center text-[#777]"
						role="alert"
					>
						光照资源加载失败，反射效果已降级。
					</div>
				)}
				{!environmentError && !environment && workspace.model && (
					<div
						className="absolute top-1/2 w-full text-center text-[#777]"
						role="status"
					>
						正在准备光照…
					</div>
				)}
				<header
					className={`${layoutStyles.previewHeader} flex items-center justify-between gap-4 max-[700px]:gap-2`}
				>
					<div className="flex min-w-0 items-center gap-3 max-[700px]:gap-1.5">
						<ProductMenu product="keychain" />
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									className={PILL_CLASS_NAME}
									aria-label={`${productName}，设置连接件和颜色`}
								>
									{productName}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								align="start"
								className={`${controlStyles.popoverContent} max-[700px]:select-none`}
							>
								<KeychainProductControls
									settings={workspace.settings}
									onChange={workspace.change}
								/>
							</PopoverContent>
						</Popover>
					</div>
					{mobile ? (
						<KeychainSize workspace={workspace} arrow="down" />
					) : (
						<span
							className={`${PILL_CLASS_NAME} gap-[5px] [&_span]:text-xs [&_span]:text-[#c2c2c2] max-[1100px]:hidden`}
						>
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
