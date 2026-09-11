import { ImagePlus, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Settings } from "@/lib/badge/types";
import controlStyles from "@/styles/studio-controls.module.css";
import {
	ART_THUMBNAIL_CLASS_NAME,
	CONTROL_SECTION_CLASS_NAME,
	FILE_STATUS_CLASS_NAME,
	IMAGE_ROW_CLASS_NAME,
	POPOVER_LABEL_CLASS_NAME,
	UPLOAD_BUTTON_CLASS_NAME,
} from "./classNames";
import { RangeControl } from "./RangeControl";

type ArtworkControlsProps = {
	settings: Settings;
	thumbnail: string;
	artworkName: string;
	inputRef: RefObject<HTMLInputElement | null>;
	onSettingChange: (
		key: keyof Settings,
		value: Settings[keyof Settings],
	) => void;
	onResetCrop: () => void;
	onUpload: (file?: File) => Promise<void>;
};

export function ArtworkControls({
	settings,
	thumbnail,
	artworkName,
	inputRef,
	onSettingChange,
	onResetCrop,
	onUpload,
}: ArtworkControlsProps) {
	return (
		<section className={CONTROL_SECTION_CLASS_NAME}>
			<h2>图像</h2>
			<div className={IMAGE_ROW_CLASS_NAME}>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							className={ART_THUMBNAIL_CLASS_NAME}
							aria-label="调整图像裁切"
						>
							{thumbnail && <img src={thumbnail} alt={artworkName} />}
							<span
								className="absolute right-1.25 bottom-1.25 rounded-[5px] bg-[#292929]
							 p-1.25 text-white [&_svg]:size-4"
							>
								<SlidersHorizontal />
							</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className={`${controlStyles.popoverContent} ${controlStyles.cropPopover} max-[700px]:select-none`}
					>
						<p className={POPOVER_LABEL_CLASS_NAME}>图像裁切</p>
						<RangeControl
							label="缩放"
							value={settings.zoom}
							display={`${Math.round(settings.zoom * 100)}%`}
							min={1}
							max={3}
							step={0.01}
							onChange={(value) => onSettingChange("zoom", value)}
						/>
						<RangeControl
							label="水平位置"
							value={settings.x}
							display={`${settings.x}%`}
							min={-50}
							max={50}
							onChange={(value) => onSettingChange("x", value)}
						/>
						<RangeControl
							label="垂直位置"
							value={settings.y}
							display={`${settings.y}%`}
							min={-50}
							max={50}
							onChange={(value) => onSettingChange("y", value)}
						/>
						<Button variant="outline" onClick={onResetCrop}>
							<RotateCcw /> 重置裁切
						</Button>
					</PopoverContent>
				</Popover>
				<Button
					variant="ghost"
					className={UPLOAD_BUTTON_CLASS_NAME}
					aria-label="上传图像"
					onClick={() => inputRef.current?.click()}
				>
					<Plus />
				</Button>
				<input
					ref={inputRef}
					type="file"
					hidden
					accept="image/png,image/jpeg,image/webp"
					onChange={(event) => {
						const file = event.target.files?.[0];
						event.currentTarget.value = "";
						void onUpload(file);
					}}
				/>
			</div>
			<div className={FILE_STATUS_CLASS_NAME}>
				<ImagePlus />
				<span title={artworkName}>{artworkName}</span>
			</div>
		</section>
	);
}
