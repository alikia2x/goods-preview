import { ImagePlus, Plus, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Settings } from "@/lib/badge/types";
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
		<section className="control-section">
			<h2>图像</h2>
			<div className="image-row">
				<Popover>
					<PopoverTrigger asChild>
						<Button className="art-thumbnail" aria-label="调整图像裁切">
							{thumbnail && <img src={thumbnail} alt={artworkName} />}
							<span className="thumbnail-edit">
								<SlidersHorizontal />
							</span>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="crop-popover">
						<p className="popover-label">图像裁切</p>
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
					className="upload-button"
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
			<div className="file-status">
				<ImagePlus />
				<span title={artworkName}>{artworkName}</span>
			</div>
		</section>
	);
}
