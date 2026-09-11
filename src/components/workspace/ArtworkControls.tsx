import { ImagePlus, Plus, SlidersHorizontal } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { Settings } from "@/lib/badge/types";
import controlStyles from "@/styles/studio-controls.module.css";
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
	onUpload: (file?: File) => Promise<void>;
};

export function ArtworkControls({
	settings,
	thumbnail,
	artworkName,
	inputRef,
	onSettingChange,
	onUpload,
}: ArtworkControlsProps) {
	return (
		<section className="mb-8 [&_h2]:mb-3 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-[#dedede] max-[700px]:mb-4 max-[700px]:[&_h2]:mb-2">
			<h2>图像</h2>
			<div className="flex gap-4">
				<div className="relative h-[100px] w-[100px] max-[700px]:size-20">
					<Button
						variant="ghost"
						className="relative h-[100px] w-[100px] overflow-hidden !rounded-[10px] !bg-[#888] p-0 max-[700px]:!size-20 [&_img]:size-full [&_img]:object-cover absolute inset-0 !size-full"
						aria-label="更换图像"
						onClick={() => inputRef.current?.click()}
					>
						{thumbnail && <img src={thumbnail} alt={artworkName} />}
					</Button>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="absolute right-1 bottom-1 z-10 !rounded-[5px] !bg-[#292929] p-1.25 !text-white hover:!bg-[#3b3b3b] [&_svg]:size-4"
								aria-label="调整出血"
							>
								<SlidersHorizontal />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className={`${controlStyles.popoverContent} max-[700px]:select-none`}
						>
							<p className="mb-4 text-sm">图像调整</p>
							<RangeControl
								label="出血"
								value={settings.bleed}
								display={`${settings.bleed} mm`}
								min={0}
								max={5}
								step={0.5}
								onChange={(value) => onSettingChange("bleed", value)}
							/>
						</PopoverContent>
					</Popover>
				</div>
				<Button
					variant="ghost"
					className="relative h-[100px] w-[100px] overflow-hidden !rounded-[10px] !border-0 !bg-[#888] p-0 !text-[#e5e5e5] hover:!bg-[#505050] max-[700px]:!size-20 [&_svg]:size-[25px]"
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
			<div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#aaa] [&_svg]:size-3 [&_span]:max-w-[240px] [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap">
				<ImagePlus />
				<span>内容图像</span>
			</div>
		</section>
	);
}
