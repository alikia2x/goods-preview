import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { ArtworkUploadSection } from "@/components/workspace/ArtworkUploadSection";
import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import { StudioControls } from "@/components/workspace/StudioControls";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import {
	TICKET_FINISHES,
	type TicketSettings,
} from "@/features/ticket/settings";
export function TicketFinishControls() {
	const { settings, updateSetting } = useWorkspace<TicketSettings>();
	return (
		<OptionButtonGroup
			options={["laser", "glitter", "silver"] as const}
			value={settings.finish}
			onChange={(value) => updateSetting("finish", value)}
			renderLabel={(value) => TICKET_FINISHES[value]}
		/>
	);
}
export function TicketControls({
	thumbnail,
	artworkName,
	onUpload,
}: {
	thumbnail: string;
	artworkName: string;
	onUpload: (file?: File) => Promise<void>;
}) {
	const { settings, updateSetting } = useWorkspace<TicketSettings>();
	return (
		<>
			<ArtworkUploadSection
				thumbnail={thumbnail}
				name={artworkName}
				status={<span>{artworkName}</span>}
				changeLabel="更换票面图案"
				uploadLabel="上传票面图案"
				onUpload={onUpload}
			/>
			<AdjustmentSection title="姿态">
				<OptionButtonGroup
					options={["standing", "flat"] as const}
					value={settings.pose}
					onChange={(value) => updateSetting("pose", value)}
					renderLabel={(value) => (value === "flat" ? "躺倒" : "立放")}
				/>
			</AdjustmentSection>
			<StudioControls glossLabel="覆膜反光" hideGloss />
		</>
	);
}
