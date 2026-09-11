import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/useMobile";
import panelStyles from "@/styles/adjustment-panel.module.css";
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
			className={`${panelStyles.adjustPanel} fixed top-(--workspace-inset) right-(--workspace-inset)
				bottom-(--workspace-inset) z-1 flex min-h-0 w-(--panel-width)
				flex-col rounded-[36px] bg-[#292929] p-7.5 text-[#fafafa] shadow-[0_12px_40px_#0000001a]
				max-[1100px]:p-6.5`}
			data-expanded={!mobile || expanded}
			aria-label={label}
		>
			<div
				className={`${panelStyles.panelHeading} flex shrink-0 items-center justify-between gap-4 mb-8
					 min-h-11 max-[700px]:mb-2`}
			>
				<h1
					className="m-0 text-[34px] font-[650] leading-[1.2] underline decoration-[7px] text-white
				 decoration-[#009fff] -underline-offset-2 [text-decoration-skip-ink:none] max-[700px]:text-[26px]"
				>
					调整
				</h1>
				{mobile ? (
					<div className="flex gap-2">
						<Button
							className="size-12! rounded-full!"
							variant="ghost"
							size="icon"
							aria-label={exportProps.busy ? "正在导出" : "下载 PNG"}
							disabled={!exportProps.ready || exportProps.busy}
							onClick={() => void exportProps.onExport()}
						>
							<Download />
						</Button>
						<Button
							className="size-12! rounded-full!"
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
					<svg className="size-10.5" viewBox="0 0 48 48" aria-hidden="true">
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
			<div
				id={id}
				className={`${panelStyles.panelScroll} min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-1
					px-2.5 max-[700px]:min-h-0 max-[700px]:px-1.5 max-[700px]:py-0 max-[700px]:overscroll-contain
					 max-[700px]:touch-pan-y`}
				aria-hidden={mobile && !expanded}
				inert={mobile && !expanded}
			>
				{children}
				{mobile && <ExportControls {...exportProps} showDownload={false} />}
			</div>
			{!mobile && <ExportControls {...exportProps} />}
		</aside>
	);
}
