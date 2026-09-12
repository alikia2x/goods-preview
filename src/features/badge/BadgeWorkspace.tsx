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
import { useStudioEnvironment } from "@/features/studio/useStudioEnvironment";

export default function BadgeWorkspace() {
	const workspace = useBadgeWorkspace();
	const { settings, updateSetting, exportState } = workspace;
	const {
		environment,
		environmentError,
		onEnvironmentReady,
		onEnvironmentError,
	} = useStudioEnvironment(settings.lighting);

	const pose = useMemo(() => badgePose(settings.scene), [settings.scene]);
	const views = useMemo(() => badgeViews(), []);
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
						poseKey={settings.scene}
						views={views}
						minDistance={BADGE_MIN_DISTANCE}
						maxDistance={BADGE_MAX_DISTANCE}
					>
						{workspace.artwork && (
							<BadgeModel
								settings={settings}
								artwork={workspace.artwork}
								shadowRef={workspace.shadowRef}
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
