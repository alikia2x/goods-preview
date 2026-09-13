import { SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { ArtworkUploadSection } from "@/components/workspace/ArtworkUploadSection";
import { RangeControl } from "@/components/workspace/RangeControl";
import { StudioControls } from "@/components/workspace/StudioControls";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { AcrylicSheetSettings } from "@/features/acrylic/settings";
import type { ProductKind } from "@/tuning";

// What every acrylic product configures: the images on the sheet, the sheet it
// is cut from, and the shared studio. Settings come from WorkspaceContext; only
// the image metadata is passed in.
export function AcrylicSheetControls({
	thumbnail,
	windowThumbnail,
	baseThumbnail,
	loading,
	onUpload,
	onWindowUpload,
	onWindowClear,
	onBaseUpload,
	onBaseClear,
	poseControls,
	product,
}: {
	thumbnail: string;
	windowThumbnail: string;
	baseThumbnail: string;
	loading: boolean;
	product: ProductKind;
	onUpload: (file?: File) => Promise<void>;
	onWindowUpload: (file?: File) => Promise<void>;
	onWindowClear: () => void;
	onBaseUpload?: (file?: File) => Promise<void>;
	onBaseClear?: () => void;
	/** The pose section, supplied only by products that expose one. */
	poseControls?: ReactNode;
}) {
	const { settings, updateSetting } = useWorkspace<AcrylicSheetSettings>();
	return (
		<>
			<ArtworkUploadSection
				items={[
					{
						thumbnail,
						label: "图案",
						ariaLabel: "图案",
						onUpload: (file) => void onUpload(file),
					},
					...(product === "standee" && onBaseUpload
						? [
								{
									thumbnail: baseThumbnail,
									label: "底座图案",
									ariaLabel: "底座图案",
									onUpload: (file: File) => void onBaseUpload(file),
									overlay:
										baseThumbnail && onBaseClear ? (
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="absolute right-1 bottom-1 z-10 rounded-[5px]! bg-panel! p-1.25 text-white! hover:bg-panel-hover! [&_svg]:size-4"
														aria-label="调整底座图案"
													>
														<SlidersHorizontal />
													</Button>
												</PopoverTrigger>
												<PopoverContent>
													<p className="mb-4 text-sm">图像调整</p>
													<Button
														variant="destructive"
														className="w-full"
														onClick={onBaseClear}
													>
														删除底座图案
													</Button>
												</PopoverContent>
											</Popover>
										) : undefined,
								},
							]
						: []),
					{
						thumbnail: windowThumbnail,
						label: "彩窗",
						ariaLabel: "彩窗",
						onUpload: (file) => void onWindowUpload(file),
						overlay: windowThumbnail ? (
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="absolute right-1 bottom-1 z-10 rounded-[5px]! bg-panel! p-1.25 text-white! hover:bg-panel-hover! [&_svg]:size-4"
										aria-label="调整彩窗浓度"
									>
										<SlidersHorizontal />
									</Button>
								</PopoverTrigger>
								<PopoverContent>
									<p className="mb-4 text-sm">图像调整</p>
									<RangeControl
										label="彩窗浓度"
										value={settings.windowStrength}
										display={`${settings.windowStrength}%`}
										min={0}
										max={100}
										step={5}
										onChange={(value) => updateSetting("windowStrength", value)}
									/>
									<Button
										variant="destructive"
										className="mt-4 w-full"
										onClick={onWindowClear}
									>
										清除彩窗
									</Button>
								</PopoverContent>
							</Popover>
						) : undefined,
					},
				]}
				status={loading ? <span>正在处理图像…</span> : undefined}
			/>
			{poseControls}
			<AdjustmentSection title="亚克力">
				<RangeControl
					label="厚度"
					value={settings.thickness}
					min={1}
					max={product === "acrylic" ? 25 : 8}
					step={0.5}
					display={`${settings.thickness} mm`}
					onChange={(value) => updateSetting("thickness", value)}
				/>
				<RangeControl
					label="透明留边"
					value={settings.border}
					min={1}
					max={10}
					step={0.5}
					display={`${settings.border} mm`}
					onChange={(value) => updateSetting("border", value)}
				/>
			</AdjustmentSection>
			<StudioControls glossLabel="反光强度" />
		</>
	);
}
