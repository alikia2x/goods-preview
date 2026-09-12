import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { StudioControls } from "@/components/workspace/StudioControls";
import { ArtworkControls } from "@/features/badge/controls/ArtworkControls";
import { PoseControls } from "@/features/badge/controls/PoseControls";

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
	return (
		<>
			<ArtworkControls
				thumbnail={thumbnail}
				artworkName={artworkName}
				onUpload={onUpload}
			/>
			<AdjustmentSection title="姿态">
				<PoseControls />
			</AdjustmentSection>
			<StudioControls glossLabel="覆膜反光" />
		</>
	);
}
