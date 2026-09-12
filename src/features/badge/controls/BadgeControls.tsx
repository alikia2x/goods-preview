import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { StudioControls } from "@/components/workspace/StudioControls";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { ArtworkControls } from "@/features/badge/controls/ArtworkControls";
import { PoseControls } from "@/features/badge/controls/PoseControls";
import type { BadgeSettings } from "@/features/badge/settings";

// Everything the badge panel adds beyond the shared studio controls. Settings
// come from WorkspaceContext; only the artwork metadata is passed in.
export function BadgeControls({
	thumbnail,
	artworkName,
	onUpload,
}: {
	thumbnail: string;
	artworkName: string;
	onUpload: (file?: File) => Promise<void>;
}) {
	const { settings } = useWorkspace<BadgeSettings>();
	return (
		<>
			<ArtworkControls
				thumbnail={thumbnail}
				artworkName={artworkName}
				onUpload={onUpload}
			/>
			<StudioControls
				glossLabel="覆膜反光"
				afterScene={
					settings.scene === "table" ? (
						<AdjustmentSection title="姿态">
							<PoseControls />
						</AdjustmentSection>
					) : null
				}
			/>
		</>
	);
}
