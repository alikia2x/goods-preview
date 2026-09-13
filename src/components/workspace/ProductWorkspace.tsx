import type { ReactNode, RefObject } from "react";
import { AdjustmentPanel } from "@/components/workspace/AdjustmentPanel";
import { PreviewToolbar } from "@/components/workspace/PreviewToolbar";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { DebugPanel } from "@/features/studio/components/DebugPanel";
import { TuningPanel } from "@/features/studio/components/TuningPanel";
import type { StudioView } from "@/features/studio/components/StudioViewport";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import type { ProductKind } from "@/tuning";
import layoutStyles from "@/styles/workspace.module.css";

// The one workspace shell. A product supplies its canvas, its controls and its
// status overlays; layout, header, footer, panel and export chrome are shared.
// Settings and export state reach the panel through WorkspaceContext instead of
// being threaded here. A product with nothing to configure omits its variants.
export function ProductWorkspace({
	product,
	productName,
	variantAriaLabel,
	variantControls,
	variantContentClassName,
	renderSizeControl,
	modelControls,
	panelLabel,
	framingRef,
	canvasHostRef,
	canvas,
	overlays,
	onViewChange,
}: {
	product: ProductKind;
	productName: string;
	variantAriaLabel?: string;
	variantControls?: ReactNode;
	variantContentClassName?: string;
	renderSizeControl: (placement: "header" | "footer") => ReactNode;
	modelControls: ReactNode;
	panelLabel: string;
	framingRef: RefObject<HTMLElement | null>;
	canvasHostRef?: RefObject<HTMLDivElement | null>;
	canvas: ReactNode;
	overlays?: ReactNode;
	onViewChange: (view: StudioView) => void;
}) {
	const mobile = useMobile() === "mobile";
	const { exportState } = useWorkspace();
	return (
		<main
			className={cn(layoutStyles.workspace, "h-dvh bg-transparent text-panel")}
		>
			<WorkspaceLayout
				ariaLabel={`${productName} 预览工作区`}
				framingRef={framingRef}
				canvasHostRef={canvasHostRef}
				canvas={canvas}
				overlays={overlays}
				cropMaskVisible={exportState.cropMaskVisible}
				header={
					<WorkspaceHeader
						product={product}
						productName={productName}
						variantAriaLabel={variantAriaLabel}
						variant={variantControls}
						variantContentClassName={variantContentClassName}
						sizeControl={renderSizeControl("header")}
					/>
				}
				footer={
					!mobile && (
						<PreviewToolbar onViewChange={onViewChange}>
							{renderSizeControl("footer")}
						</PreviewToolbar>
					)
				}
			/>
			<AdjustmentPanel label={panelLabel}>{modelControls}</AdjustmentPanel>
			{import.meta.env.DEV && (
				<>
					<DebugPanel />
					<TuningPanel product={product} />
				</>
			)}
		</main>
	);
}
