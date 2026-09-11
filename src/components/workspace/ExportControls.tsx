import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EXPORT_RESOLUTIONS } from "@/lib/badge/constants";
import { exportDimensions } from "@/lib/badge/studio";

export type ExportControlsProps = {
	ready: boolean;
	busy: boolean;
	error: string;
	resolution: string;
	transparentBackground: boolean;
	onResolutionChange: (value: string) => void;
	onTransparentBackgroundChange: (value: boolean) => void;
	onExport: () => Promise<void>;
	showDownload?: boolean;
};

export function ExportControls({
	ready,
	busy,
	error,
	resolution,
	transparentBackground,
	onResolutionChange,
	onTransparentBackgroundChange,
	onExport,
	showDownload = true,
}: ExportControlsProps) {
	return (
		<div className="pt-6 max-[700px]:shrink-0 max-[700px]:pt-2">
			{error && (
				<p role="alert" className="mb-3.5 text-xs text-[#ffac9f]">
					{error}
				</p>
			)}
			<div className="mb-3.5 flex items-center justify-between text-xs text-[#aaa] tabular-nums max-[700px]:mb-1.5">
				<label htmlFor="transparent-background">透明背景</label>
				<Switch
					id="transparent-background"
					checked={transparentBackground}
					onCheckedChange={onTransparentBackgroundChange}
				/>
			</div>
			<div className="mb-3.5 flex items-center justify-between text-xs text-[#aaa] tabular-nums max-[700px]:mb-1.5">
				<label htmlFor="resolution">导出尺寸</label>
				<Select value={resolution} onValueChange={onResolutionChange}>
					<SelectTrigger
						id="resolution"
						className="w-auto border-0 bg-transparent text-[#eee] shadow-none tabular-nums"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="!rounded-[20px] !bg-[#292929] !p-2.5 shadow-[0_10px_30px_#0003] max-[700px]:select-none">
						{EXPORT_RESOLUTIONS.map((value) => {
							const dimensions = exportDimensions(Number(value));
							return (
								<SelectItem key={value} value={value}>
									{dimensions.width} × {dimensions.height}
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
			</div>
			{showDownload && (
				<Button
					className="h-[50px] w-full gap-3.5 !rounded-full bg-white text-[15px] !text-[#292929] hover:bg-[#e6e6e6] max-[700px]:h-11"
					disabled={!ready || busy}
					onClick={() => void onExport()}
				>
					<Download />
					{busy ? "正在导出…" : "保存为 PNG"}
				</Button>
			)}
		</div>
	);
}
