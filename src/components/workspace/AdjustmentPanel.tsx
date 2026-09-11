import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExportControls } from "@/components/workspace/ExportControls";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { useMobile } from "@/hooks/useMobile";
import panelStyles from "@/styles/adjustment-panel.module.css";

export function AdjustmentPanel({
	children,
	label,
}: {
	children: ReactNode;
	label: string;
}) {
	const mobile = useMobile() === "mobile";
	const { exportState } = useWorkspace();
	const [expanded, setExpanded] = useState(true);
	const id = useId();
	return (
		<aside
			className={`${panelStyles.adjustPanel} fixed top-(--workspace-inset) right-(--workspace-inset)
				bottom-(--workspace-inset) z-1 flex min-h-0 w-(--panel-width)
				flex-col rounded-[36px] bg-panel p-7.5 text-panel-foreground shadow-[0_12px_40px_#0000001a]
				max-compact:p-6.5`}
			data-expanded={expanded}
			aria-label={label}
		>
			<div
				className={`${panelStyles.panelHeading} flex shrink-0 items-center justify-between gap-4 mb-8
					 min-h-11 max-mobile:mb-2`}
			>
				<h1
					className="m-0 text-[34px] font-[650] leading-[1.2] underline decoration-[7px] text-white
				 decoration-brand -underline-offset-2 [text-decoration-skip-ink:none] max-mobile:text-[26px]"
				>
					调整
				</h1>
				{mobile ? (
					<div className="flex gap-2">
						<Button
							className="size-12! rounded-full!"
							variant="ghost"
							size="icon"
							aria-label={exportState.busy ? "正在导出" : "下载 PNG"}
							disabled={!exportState.ready || exportState.busy}
							onClick={() => void exportState.onExport()}
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
							className="stroke-brand"
							cx="28"
							cy="24"
							r="17"
							fill="none"
							strokeWidth="4"
						/>
						<path className="stroke-coral" d="M2 21h26" strokeWidth="5" />
						<path d="M9 29h26" stroke="white" strokeWidth="5" />
					</svg>
				)}
			</div>
			<div
				id={id}
				className={`${panelStyles.panelScroll} min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-1
					px-2.5 max-mobile:min-h-0 max-mobile:px-1.5 max-mobile:py-0 max-mobile:overscroll-contain
				max-mobile:touch-pan-y`}
				inert={mobile && !expanded}
			>
				{children}
				{mobile && <ExportControls {...exportState} showDownload={false} />}
			</div>
			{!mobile && <ExportControls {...exportState} />}
		</aside>
	);
}
