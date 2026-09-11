import { useMemo } from "react";
import { ProductWorkspace } from "@/components/workspace/ProductWorkspace";
import { KeychainControls } from "@/features/keychain/controls/KeychainControls";
import { KeychainProductControls } from "@/features/keychain/controls/KeychainProductControls";
import { KeychainSizePopover } from "@/features/keychain/controls/KeychainSizePopover";
import { KeychainKeyLight } from "@/features/keychain/model/KeychainKeyLight";
import { KeychainModel } from "@/features/keychain/model/KeychainModel";
import { ShadowPlanes } from "@/features/keychain/model/ShadowPlanes";
import {
	KEYCHAIN_MAX_DISTANCE,
	KEYCHAIN_MIN_DISTANCE,
	keychainPose,
	keychainViews,
} from "@/features/keychain/model/views";
import { useKeychainWorkspace } from "@/features/keychain/useKeychainWorkspace";
import { studioDistance } from "@/features/studio/lib/framing";
import { keychainFrame } from "@/features/keychain/lib/geometry";
import { KEYCHAIN_HARDWARE_COLORS } from "@/features/keychain/lib/materials";
import { StudioCanvas } from "@/features/studio/components/StudioCanvas";
import { StudioStatus } from "@/features/studio/components/StudioStatus";
import { useStudioEnvironment } from "@/features/studio/useStudioEnvironment";

const CAMERA_FOV = 35;

export default function KeychainWorkspace() {
	const workspace = useKeychainWorkspace();
	const { settings, model, updateSetting } = workspace;
	const {
		environment,
		environmentError,
		onEnvironmentReady,
		onEnvironmentError,
	} = useStudioEnvironment(settings.lighting);

	const frame = useMemo(
		() =>
			model
				? keychainFrame(model.outline, settings.size, settings.hardware)
				: { center: [0, 0.6, 0] as [number, number, number], span: 3.6 },
		[model, settings.size, settings.hardware],
	);
	const distance = studioDistance(frame.span, CAMERA_FOV);
	const pose = useMemo(
		() => keychainPose(frame.center, distance),
		[frame.center, distance],
	);
	const views = useMemo(
		() => keychainViews(frame.center, distance),
		[frame.center, distance],
	);
	const productName = `亚克力钥匙扣 · ${KEYCHAIN_HARDWARE_COLORS[settings.hardwareColor].label}`;

	return (
		<ProductWorkspace
			product="keychain"
			productName={productName}
			variantAriaLabel={`${productName}，设置连接件和颜色`}
			variantControls={
				<KeychainProductControls
					hardwareColor={settings.hardwareColor}
					onChange={(value) => updateSetting("hardwareColor", value)}
				/>
			}
			renderSizeControl={(placement) => (
				<KeychainSizePopover
					size={settings.size}
					arrow={placement === "header" ? "down" : "up"}
					align={placement === "header" ? "end" : "start"}
					onSizeChange={(value) => updateSetting("size", value)}
				/>
			)}
			modelControls={
				<KeychainControls
					settings={settings}
					thumbnail={model?.artwork.thumbnail ?? ""}
					name={model?.artwork.name ?? ""}
					loading={workspace.loading}
					onSettingChange={updateSetting}
					onUpload={workspace.upload}
				/>
			}
			panelLabel="调整钥匙扣"
			framingRef={workspace.framingRef}
			canvas={
				<StudioCanvas
					settings={settings}
					environment={environment}
					onEnvironmentReady={onEnvironmentReady}
					onEnvironmentError={onEnvironmentError}
					framingRef={workspace.framingRef}
					backgroundRef={workspace.backgroundRef}
					backgroundObjects={workspace.backgroundObjects}
					apiRef={workspace.apiRef}
					onViewportReady={workspace.onViewportReady}
					pose={pose}
					poseKey={frame}
					views={views}
					minDistance={KEYCHAIN_MIN_DISTANCE}
					maxDistance={KEYCHAIN_MAX_DISTANCE}
					sceneObjects={
						<>
							<KeychainKeyLight
								preset={settings.lighting}
								intensity={settings.light}
								azimuth={settings.lightAzimuth}
								elevation={settings.lightElevation}
								scene={settings.scene}
							/>
							<ShadowPlanes kind={settings.scene} shadow={settings.shadow} />
						</>
					}
				>
					{model && <KeychainModel {...model} settings={settings} />}
				</StudioCanvas>
			}
			overlays={
				<StudioStatus
					environmentReady={environment !== null}
					environmentError={environmentError}
				/>
			}
			ready={workspace.ready}
			busy={workspace.busy}
			error={workspace.error}
			resolution={workspace.resolution}
			transparentBackground={settings.transparentBackground}
			onResolutionChange={workspace.setResolution}
			onTransparentBackgroundChange={(value) =>
				updateSetting("transparentBackground", value)
			}
			onExport={workspace.exportArtwork}
			onViewChange={(view) => workspace.apiRef.current?.view(view)}
		/>
	);
}
