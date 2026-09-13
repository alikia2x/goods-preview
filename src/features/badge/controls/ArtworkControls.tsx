import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ArtworkUploadSection } from "@/components/workspace/ArtworkUploadSection";
import { RangeControl } from "@/components/workspace/RangeControl";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { BadgeSettings } from "@/features/badge/settings";

export function ArtworkControls({
	thumbnail,
	onUpload,
}: {
	thumbnail: string;
	onUpload: (file?: File) => Promise<void>;
}) {
	const { settings, updateSetting } = useWorkspace<BadgeSettings>();
	return (
		<ArtworkUploadSection
			items={[
				{
					thumbnail,
					label: "制品图像",
					ariaLabel: "制品图像",
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
			]}
		/>
	);
}
