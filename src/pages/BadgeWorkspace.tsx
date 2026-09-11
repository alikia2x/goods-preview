import { DebugPanel } from "@/components/studio/DebugPanel";
import { BadgeAdjustmentPanel } from "@/components/workspace/BadgeAdjustmentPanel";
import { BadgePreview } from "@/components/workspace/BadgePreview";
import { useBadgeWorkspace } from "@/hooks/useBadgeWorkspace";
import layoutStyles from "@/styles/workspace.module.css";

export default function BadgeWorkspace() {
	const workspace = useBadgeWorkspace();

	return (
		<main
			className={`${layoutStyles.workspace} h-dvh bg-transparent text-[#292929]`}
		>
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
				onUpload={workspace.uploadArtwork}
				onResolutionChange={workspace.setResolution}
				onExport={workspace.exportArtwork}
			/>
			{import.meta.env.DEV && <DebugPanel />}
		</main>
	);
}
