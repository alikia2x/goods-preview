import { Camera, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EXPORT_RESOLUTIONS } from "@/features/badge/constants";

export type ExportControlsProps = {
	ready: boolean;
	busy: boolean;
	error: string;
	resolution: string;
	transparentBackground: boolean;
	cropMaskVisible: boolean;
	onResolutionChange: (value: string) => void;
	onTransparentBackgroundChange: (value: boolean) => void;
	onCropMaskVisibleChange: (value: boolean) => void;
	onExport: () => Promise<void>;
	showDownload?: boolean;
};

export function ExportControls({
	ready,
	busy,
	error,
	resolution,
	transparentBackground,
	cropMaskVisible,
	onResolutionChange,
	onTransparentBackgroundChange,
	onCropMaskVisibleChange,
	onExport,
	showDownload = true,
}: ExportControlsProps) {
	return (
		<div className="pt-6 max-mobile:shrink-0 max-mobile:pt-2">
			{error && (
				<p role="alert" className="mb-3.5 text-xs text-danger-soft">
					{error}
				</p>
			)}
			<div className="mb-3.5 flex items-center justify-between text-xs text-panel-subtle tabular-nums max-mobile:mb-1.5">
				<label htmlFor="transparent-background">透明背景</label>
				<Switch
					id="transparent-background"
					checked={transparentBackground}
					onCheckedChange={onTransparentBackgroundChange}
				/>
			</div>
			<div className="mb-3.5 flex items-center justify-between text-xs text-panel-subtle tabular-nums max-mobile:mb-1.5">
				<label htmlFor="resolution">导出尺寸</label>
				<Select value={resolution} onValueChange={onResolutionChange}>
					<SelectTrigger
						id="resolution"
						className="w-auto border-0 bg-transparent text-panel-value shadow-none tabular-nums"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="rounded-[20px]! bg-panel! p-2.5! shadow-[0_10px_30px_#0003] max-mobile:select-none">
						{EXPORT_RESOLUTIONS.map((value) => (
							<SelectItem key={value} value={value}>
								{value} × {value}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			{showDownload && (
				<div className="flex gap-2.5">
					<Button
						className="size-[50px]! rounded-full! border-white/15 text-white hover:bg-white/10 hover:text-white aria-pressed:bg-white/15"
						variant="outline"
						size="icon"
						aria-label={cropMaskVisible ? "关闭取景框遮罩" : "开启取景框遮罩"}
						aria-pressed={cropMaskVisible}
						onClick={() => onCropMaskVisibleChange(!cropMaskVisible)}
					>
						<Camera />
					</Button>
					<Button
						className="h-[50px] min-w-0 flex-1 gap-3.5 rounded-full! bg-white text-[15px] text-panel! hover:bg-inverse-hover"
						disabled={!ready || busy}
						onClick={() => void onExport()}
					>
						<Download />
						{busy ? "正在导出…" : "保存为 PNG"}
					</Button>
				</div>
			)}
		</div>
	);
}
