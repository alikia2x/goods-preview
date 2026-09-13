import { useMemo } from "react";
import { ProductWorkspace } from "@/components/workspace/ProductWorkspace";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import { BadgeControls } from "@/features/badge/controls/BadgeControls";
import { BadgeSizePopover } from "@/features/badge/controls/BadgeSizePopover";
import { FinishControls } from "@/features/badge/controls/FinishControls";
import { BadgeModel } from "@/features/badge/model/BadgeModel";
import { FINISHES } from "@/features/badge/model/finishes";
import {
	BADGE_MAX_DISTANCE,
	BADGE_MIN_DISTANCE,
	badgePose,
	badgeViews,
} from "@/features/badge/model/views";
import { useBadgeWorkspace } from "@/features/badge/useBadgeWorkspace";
import { StudioCanvas } from "@/features/studio/components/StudioCanvas";
import { StudioStatus } from "@/features/studio/components/StudioStatus";
import { studioDistance } from "@/features/studio/lib/framing";
import { useStudioEnvironment } from "@/features/studio/useStudioEnvironment";
import { CAMERA, PRODUCT_FRAMING_FILL } from "@/tuning";

export default function BadgeWorkspace() {
	const workspace = useBadgeWorkspace();
	const { settings, updateSetting, exportState } = workspace;
	const {
		environment,
		environmentError,
		onEnvironmentReady,
		onEnvironmentError,
	} = useStudioEnvironment(settings.lighting);

	// The badge reports what it occupies, so the camera is framed on it rather
	// than on the set's origin — it can be resting against the backdrop. The
	// framing distance follows from that measurement, at every size.
	const { frame, placementRevision } = workspace;
	const distance = studioDistance(
		frame.span,
		CAMERA.fov,
		PRODUCT_FRAMING_FILL.badge,
	);
	const pose = useMemo(
		() => badgePose(frame.center, settings.scene, settings.pose, distance),
		[frame.center, settings.scene, settings.pose, distance],
	);
	const views = useMemo(
		() => badgeViews(frame.center, distance, settings.pose),
		[frame.center, distance, settings.pose],
	);
	// The direction control is expressed from the decorated face's point of
	// view. Once that face lies upward, both axes of its horizontal presentation
	// are reversed relative to the standing rig. Rotate the azimuth by 180° while
	// preserving elevation for both lighting and the matching contact shadow.
	const renderSettings = useMemo(
		() =>
			settings.pose === "flat"
				? {
						...settings,
						lightAzimuth: ((settings.lightAzimuth + 360) % 360) - 180,
					}
				: settings,
		[settings],
	);
	const productName = `覆膜吧唧 · ${FINISHES[settings.finish].label}`;

	return (
		<WorkspaceProvider
			settings={settings}
			updateSetting={updateSetting}
			exportState={exportState}
			readPose={workspace.readPose}
		>
			<ProductWorkspace
				product="badge"
				productName={productName}
				variantAriaLabel={`${productName}，切换覆膜`}
				variantControls={<FinishControls />}
				renderSizeControl={(placement) => (
					<BadgeSizePopover
						size={settings.size}
						arrow={placement === "header" ? "down" : "up"}
						align={placement === "header" ? "end" : "start"}
						onSizeChange={(size) => updateSetting("size", size)}
					/>
				)}
				modelControls={
					<BadgeControls
						thumbnail={workspace.thumbnail}
						artworkName={workspace.artworkName}
						onUpload={workspace.uploadArtwork}
					/>
				}
				panelLabel="调整徽章"
				framingRef={workspace.framingRef}
				canvas={
					<StudioCanvas
						settings={renderSettings}
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
						minDistance={BADGE_MIN_DISTANCE}
						maxDistance={BADGE_MAX_DISTANCE}
					>
						{workspace.artwork && (
							<BadgeModel
								settings={renderSettings}
								artwork={workspace.artwork}
								shadowRef={workspace.shadowRef}
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
