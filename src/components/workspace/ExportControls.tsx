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

type ExportControlsProps = {
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
		<div className="export-area">
			{error && (
				<p role="alert" className="error-message">
					{error}
				</p>
			)}
			<div className="export-resolution">
				<label htmlFor="resolution">导出尺寸</label>
				<Select value={resolution} onValueChange={onResolutionChange}>
					<SelectTrigger id="resolution" className="resolution-select">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
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
					className="export-button"
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
