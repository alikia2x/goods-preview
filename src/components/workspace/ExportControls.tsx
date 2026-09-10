import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EXPORT_RESOLUTIONS } from "@/lib/badge/constants";
import { exportDimensions } from "@/lib/badge/studio";
import {
	ERROR_MESSAGE_CLASS_NAME,
	EXPORT_AREA_CLASS_NAME,
	EXPORT_BUTTON_CLASS_NAME,
	EXPORT_RESOLUTION_CLASS_NAME,
	SELECT_CONTENT_CLASS_NAME,
} from "./classNames";

export type ExportControlsProps = {
	ready: boolean;
	busy: boolean;
	error: string;
	resolution: string;
	onResolutionChange: (value: string) => void;
	onExport: () => Promise<void>;
	showDownload?: boolean;
};

export function ExportControls({
	ready,
	busy,
	error,
	resolution,
	onResolutionChange,
	onExport,
	showDownload = true,
}: ExportControlsProps) {
	return (
		<div className={EXPORT_AREA_CLASS_NAME}>
			{error && (
				<p role="alert" className={ERROR_MESSAGE_CLASS_NAME}>
					{error}
				</p>
			)}
			<div className={EXPORT_RESOLUTION_CLASS_NAME}>
				<label htmlFor="resolution">导出尺寸</label>
				<Select value={resolution} onValueChange={onResolutionChange}>
					<SelectTrigger
						id="resolution"
						className="w-auto border-0 bg-transparent text-[#eee] shadow-none tabular-nums"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent className={SELECT_CONTENT_CLASS_NAME}>
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
					className={EXPORT_BUTTON_CLASS_NAME}
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
