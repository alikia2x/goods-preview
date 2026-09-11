import { AcrylicProductControls } from "@/features/acrylic/AcrylicProductControls";
import type { KeychainSettings } from "@/features/keychain/settings";
import { useMemo } from "react";
import { ProductWorkspace } from "@/components/workspace/ProductWorkspace";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import { KeychainControls } from "@/features/keychain/controls/KeychainControls";
import { KeychainProductControls } from "@/features/keychain/controls/KeychainProductControls";
import { KeychainSizePopover } from "@/features/keychain/controls/KeychainSizePopover";
import { keychainFrame } from "@/features/keychain/lib/geometry";
import { KEYCHAIN_HARDWARE_COLORS } from "@/features/keychain/lib/materials";
import { KeychainKeyLight } from "@/features/keychain/model/KeychainKeyLight";
import { KeychainModel } from "@/features/keychain/model/KeychainModel";
import {
	KEYCHAIN_MAX_DISTANCE,
	KEYCHAIN_MIN_DISTANCE,
	keychainPose,
	keychainViews,
} from "@/features/keychain/model/views";
import { useKeychainWorkspace } from "@/features/keychain/useKeychainWorkspace";
import { StudioCanvas } from "@/features/studio/components/StudioCanvas";
import { StudioStatus } from "@/features/studio/components/StudioStatus";
import { studioDistance } from "@/features/studio/lib/framing";
import { useStudioEnvironment } from "@/features/studio/useStudioEnvironment";

const CAMERA_FOV = 35;

export default function KeychainWorkspace() {
	return <AcrylicWorkspaceContent productKind="keychain" />;
}

export function AcrylicWorkspaceContent({
	productKind,
}: {
	productKind: KeychainSettings["productKind"];
}) {
	const workspace = useKeychainWorkspace(productKind);
	const { settings, model, updateSetting, exportState } = workspace;
	const {
		environment,
		environmentError,
		onEnvironmentReady,
		onEnvironmentError,
	} = useStudioEnvironment(settings.lighting);

	const frame = useMemo(
		() =>
			model
				? keychainFrame(model.outline, settings.size, settings.hardware, {
						productKind: settings.productKind,
						baseDiameter: settings.baseDiameter,
					})
				: { center: [0, 0.6, 0] as [number, number, number], span: 3.6 },
		[
			model,
			settings.size,
			settings.hardware,
			settings.productKind,
			settings.baseDiameter,
		],
	);
	const distance = studioDistance(frame.span, CAMERA_FOV);
	const pose = useMemo(
		() =>
			productKind === "standee"
				? keychainViews(frame.center, distance).angle
				: keychainPose(frame.center, distance),
		[frame.center, distance, productKind],
	);
	const views = useMemo(
		() => keychainViews(frame.center, distance),
		[frame.center, distance],
	);
	const productName =
		productKind === "keychain"
			? `亚克力钥匙扣 · ${KEYCHAIN_HARDWARE_COLORS[settings.hardwareColor].label}`
			: productKind === "standee"
				? "亚克力立牌"
				: "任意亚克力";

	return (
		<WorkspaceProvider
			settings={settings}
			updateSetting={updateSetting}
			exportState={exportState}
		>
			<ProductWorkspace
				product={productKind}
				productName={productName}
				variantAriaLabel={`${productName}，制品设置`}
				variantControls={
					productKind === "keychain" ? (
						<KeychainProductControls />
					) : (
						<AcrylicProductControls />
					)
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
						thumbnail={model?.artwork.thumbnail ?? ""}
						name={model?.artwork.name ?? ""}
						loading={workspace.loading}
						onUpload={workspace.upload}
					/>
				}
				panelLabel={`调整${productName}`}
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
							<KeychainKeyLight
								preset={settings.lighting}
								shadow={settings.shadow}
								span={frame.span}
								intensity={settings.light}
								azimuth={settings.lightAzimuth}
								elevation={settings.lightElevation}
								scene={settings.scene}
							/>
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
				onViewChange={workspace.changeView}
			/>
		</WorkspaceProvider>
	);
}
