import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { ArtworkUploadSection } from "@/components/workspace/ArtworkUploadSection";
import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import { RangeControl } from "@/components/workspace/RangeControl";
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
	backThumbnail,
	onUpload,
	onBackUpload,
}: {
	thumbnail: string;
	backThumbnail: string;
	onUpload: (file?: File) => Promise<void>;
	onBackUpload: (file?: File) => Promise<void>;
}) {
	const { settings, updateSetting } = useWorkspace<TicketSettings>();
	return (
		<>
			<ArtworkUploadSection
				items={[
					{
						thumbnail,
						label: "票面",
						ariaLabel: "票面",
						onUpload: (file) => void onUpload(file),
						overlay: (
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="absolute right-1 bottom-1 z-10 rounded-[5px]! bg-panel! p-1.25 text-white! hover:bg-panel-hover! [&_svg]:size-4"
										aria-label="调整出血"
									>
										<SlidersHorizontal />
									</Button>
								</PopoverTrigger>
								<PopoverContent>
									<p className="mb-4 text-sm">图像调整</p>
									<RangeControl
										label="出血"
										value={settings.bleed}
										display={`${settings.bleed} mm`}
										min={0}
										max={5}
										step={0.5}
										onChange={(value) => updateSetting("bleed", value)}
									/>
								</PopoverContent>
							</Popover>
						),
					},
					{
						thumbnail: backThumbnail,
						label: "背面",
						ariaLabel: "背面",
						onUpload: (file) => void onBackUpload(file),
					},
				]}
			/>
			{settings.scene !== "standing" && (
				<AdjustmentSection title="姿态">
					<OptionButtonGroup
						options={["standing", "flat"] as const}
						value={settings.pose}
						onChange={(value) => updateSetting("pose", value)}
						renderLabel={(value) => (value === "flat" ? "躺倒" : "立放")}
					/>
				</AdjustmentSection>
			)}
			<StudioControls glossLabel="覆膜反光" hideGloss />
		</>
	);
}
