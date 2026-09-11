import { useMemo } from "react";
import { ProductWorkspace } from "@/components/workspace/ProductWorkspace";
import { BadgeControls } from "@/features/badge/controls/BadgeControls";
import { BadgeSizePopover } from "@/features/badge/controls/BadgeSizePopover";
import { FinishControls } from "@/features/badge/controls/FinishControls";
import { BadgeModel } from "@/features/badge/model/BadgeModel";
import {
	BADGE_MAX_DISTANCE,
	BADGE_MIN_DISTANCE,
	badgePose,
	badgeViews,
} from "@/features/badge/model/views";
import { FINISHES } from "@/features/badge/model/finishes";
import { useBadgeWorkspace } from "@/features/badge/useBadgeWorkspace";
import { StudioCanvas } from "@/features/studio/components/StudioCanvas";
import { StudioStatus } from "@/features/studio/components/StudioStatus";
import { SCENES } from "@/features/studio/lib/scenes";
import { useStudioEnvironment } from "@/features/studio/useStudioEnvironment";

export default function BadgeWorkspace() {
	const workspace = useBadgeWorkspace();
	const { settings, updateSetting } = workspace;
	const {
		environment,
		environmentError,
		onEnvironmentReady,
		onEnvironmentError,
	} = useStudioEnvironment(settings.lighting);

	const pose = useMemo(() => badgePose(settings.scene), [settings.scene]);
	const views = useMemo(
		() => badgeViews(SCENES[settings.scene].standing),
		[settings.scene],
	);
	const productName = `覆膜吧唧 · ${FINISHES[settings.finish].label}`;

	return (
		<ProductWorkspace
			product="badge"
			productName={productName}
			variantAriaLabel={`${productName}，切换覆膜`}
			variantControls={
				<FinishControls settings={settings} onChange={updateSetting} />
			}
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
					settings={settings}
					thumbnail={workspace.thumbnail}
					artworkName={workspace.artworkName}
					onSettingChange={updateSetting}
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
			onViewChange={workspace.changeView}
		/>
	);
}
