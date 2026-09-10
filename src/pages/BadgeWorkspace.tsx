import { DebugPanel } from "@/components/studio/DebugPanel";
import { BadgeAdjustmentPanel } from "@/components/workspace/BadgeAdjustmentPanel";
import { BadgePreview } from "@/components/workspace/BadgePreview";
import { useBadgeWorkspace } from "@/hooks/useBadgeWorkspace";

export default function BadgeWorkspace() {
	const workspace = useBadgeWorkspace();

	return (
		<main className="workspace">
			<BadgePreview
				hostRef={workspace.canvasHostRef}
				framingRef={workspace.framingRef}
				ready={workspace.ready}
				error={workspace.error}
				size={workspace.settings.size}
				settings={workspace.settings}
				onSettingChange={workspace.updateSetting}
				onSizeChange={(size) => workspace.updateSetting("size", size)}
				onViewChange={workspace.changeView}
			/>
			<BadgeAdjustmentPanel
				settings={workspace.settings}
				thumbnail={workspace.thumbnail}
				artworkName={workspace.artworkName}
				inputRef={workspace.inputRef}
				ready={workspace.ready}
				error={workspace.error}
				busy={workspace.busy}
				resolution={workspace.resolution}
				onSettingChange={workspace.updateSetting}
				onResetCrop={workspace.resetCrop}
				onUpload={workspace.uploadArtwork}
				onResolutionChange={workspace.setResolution}
				onExport={workspace.exportArtwork}
			/>
			{import.meta.env.DEV && <DebugPanel />}
		</main>
	);
}
