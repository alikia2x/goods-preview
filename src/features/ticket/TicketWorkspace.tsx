import { badgeViews } from "@/features/badge/model/views";
import { AcrylicKeyLight } from "@/features/acrylic/AcrylicKeyLight";
import { useMemo } from "react";
import { ProductWorkspace } from "@/components/workspace/ProductWorkspace";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import {
	TicketControls,
	TicketFinishControls,
} from "@/features/ticket/TicketControls";
import { PatternSizePopover } from "@/features/acrylic/PatternSizePopover";
import { TicketModel } from "@/features/ticket/TicketModel";
import { TICKET_FINISHES } from "@/features/ticket/settings";
import { useTicketWorkspace } from "@/features/ticket/useTicketWorkspace";
import {
	acrylicPose,
	acrylicViews,
	ACRYLIC_MIN_DISTANCE,
	ACRYLIC_MAX_DISTANCE,
} from "@/features/acrylic/views";
import { StudioCanvas } from "@/features/studio/components/StudioCanvas";
import { StudioStatus } from "@/features/studio/components/StudioStatus";
import { studioDistance } from "@/features/studio/lib/framing";
import { useStudioEnvironment } from "@/features/studio/useStudioEnvironment";
import { ACRYLIC_CAMERA, CAMERA, PRODUCT_FRAMING_FILL } from "@/tuning";

export default function TicketWorkspace() {
	const workspace = useTicketWorkspace();
	const { settings, updateSetting, exportState } = workspace;
	const {
		environment,
		environmentError,
		onEnvironmentReady,
		onEnvironmentError,
	} = useStudioEnvironment(settings.lighting);

	// Frame the camera around the measured ticket dimensions.
	const { frame, placementRevision } = workspace;
	const distance = studioDistance(
		frame.span,
		CAMERA.fov,
		PRODUCT_FRAMING_FILL.ticket,
	);
	const pose = useMemo(
		() =>
			acrylicPose(
				settings.pose === "flat"
					? [0.15, 1, 0.35]
					: ACRYLIC_CAMERA.opening.acrylic,
				frame.center,
				distance,
			),
		[frame.center, distance, settings.pose],
	);
	const views = useMemo(
		() =>
			settings.pose === "flat"
				? badgeViews(frame.center, distance, "flat")
				: acrylicViews(frame.center, distance),
		[frame.center, distance, settings.pose],
	);
	const productName = `镭射票 · ${TICKET_FINISHES[settings.finish]}`;

	return (
		<WorkspaceProvider
			settings={settings}
			updateSetting={updateSetting}
			exportState={exportState}
			readPose={workspace.readPose}
		>
			<ProductWorkspace
				product="ticket"
				productName={productName}
				variantAriaLabel={`${productName}，切换覆膜`}
				variantControls={<TicketFinishControls />}
				renderSizeControl={(placement) => (
					<PatternSizePopover
						size={settings.size}
						arrow={placement === "header" ? "down" : "up"}
						align={placement === "header" ? "end" : "start"}
						onSizeChange={(size) => updateSetting("size", size)}
					/>
				)}
				modelControls={
					<TicketControls
						thumbnail={workspace.thumbnail}
						onUpload={workspace.uploadArtwork}
					/>
				}
				panelLabel="调整镭射票"
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
						poseKey={placementRevision}
						views={views}
						minDistance={ACRYLIC_MIN_DISTANCE}
						maxDistance={ACRYLIC_MAX_DISTANCE}
						sceneObjects={
							<AcrylicKeyLight
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
						{workspace.artwork && (
							<TicketModel
								settings={settings}
								artwork={workspace.artwork}
								onPlaced={workspace.onPlaced}
							/>
						)}
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
