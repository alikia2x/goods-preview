import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/useMobile";
import { ExportControls, type ExportControlsProps } from "./ExportControls";

export function AdjustmentPanel({
	children,
	label,
	...exportProps
}: ExportControlsProps & { children: ReactNode; label: string }) {
	const mobile = useMobile(),
		[expanded, setExpanded] = useState(true),
		id = useId();
	return (
		<aside
			className="adjust-panel dark"
			data-expanded={!mobile || expanded}
			aria-label={label}
		>
			<div className="panel-heading">
				<h1>调整</h1>
				{mobile ? (
					<div className="panel-actions">
						<Button
							className="mobile-download"
							variant="ghost"
							size="icon"
							aria-label={exportProps.busy ? "正在导出" : "下载 PNG"}
							disabled={!exportProps.ready || exportProps.busy}
							onClick={() => void exportProps.onExport()}
						>
							<Download />
						</Button>
						<Button
							className="panel-toggle"
							variant="ghost"
							size="icon"
							aria-label={expanded ? "收起调整面板" : "展开调整面板"}
							aria-expanded={expanded}
							aria-controls={id}
							onClick={() => setExpanded((value) => !value)}
						>
							{expanded ? <ChevronDown /> : <ChevronUp />}
						</Button>
					</div>
				) : (
					<svg className="adjust-mark" viewBox="0 0 48 48" aria-hidden="true">
						<circle
							cx="28"
							cy="24"
							r="17"
							fill="none"
							stroke="#009FFF"
							strokeWidth="4"
						/>
						<path d="M2 21h26" stroke="#F36557" strokeWidth="5" />
						<path d="M9 29h26" stroke="white" strokeWidth="5" />
					</svg>
				)}
			</div>
			<div id={id} className="panel-scroll" hidden={mobile && !expanded}>
				{children}
				{mobile && <ExportControls {...exportProps} showDownload={false} />}
			</div>
			{!mobile && <ExportControls {...exportProps} />}
		</aside>
	);
}
