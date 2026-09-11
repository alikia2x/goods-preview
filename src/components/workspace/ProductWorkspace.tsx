import type { ReactNode, RefObject } from "react";
import { AdjustmentPanel } from "@/components/workspace/AdjustmentPanel";
import { PreviewToolbar } from "@/components/workspace/PreviewToolbar";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import type { StudioView } from "@/features/studio/components/StudioViewport";
import { DebugPanel } from "@/features/studio/components/DebugPanel";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import layoutStyles from "@/styles/workspace.module.css";

// The one workspace shell. A product supplies its canvas, its controls and its
// status overlays; layout, header, footer, panel and export chrome are shared.
export function ProductWorkspace({
	product,
	productName,
	variantAriaLabel,
	variantControls,
	renderSizeControl,
	modelControls,
	panelLabel,
	framingRef,
	canvasHostRef,
	canvas,
	overlays,
	ready,
	busy,
	error,
	resolution,
	transparentBackground,
	onResolutionChange,
	onTransparentBackgroundChange,
	onExport,
	onViewChange,
}: {
	product: "badge" | "keychain";
	productName: string;
	variantAriaLabel: string;
	variantControls: ReactNode;
	renderSizeControl: (placement: "header" | "footer") => ReactNode;
	modelControls: ReactNode;
	panelLabel: string;
	framingRef: RefObject<HTMLElement | null>;
	canvasHostRef?: RefObject<HTMLDivElement | null>;
	canvas: ReactNode;
	overlays?: ReactNode;
	ready: boolean;
	busy: boolean;
	error: string;
	resolution: string;
	transparentBackground: boolean;
	onResolutionChange: (value: string) => void;
	onTransparentBackgroundChange: (value: boolean) => void;
	onExport: () => Promise<void>;
	onViewChange: (view: StudioView) => void;
}) {
	const mobile = useMobile() === "mobile";
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
				header={
					<WorkspaceHeader
						product={product}
						productName={productName}
						variantAriaLabel={variantAriaLabel}
						variant={variantControls}
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
			<AdjustmentPanel
				label={panelLabel}
				ready={ready}
				busy={busy}
				error={error}
				resolution={resolution}
				transparentBackground={transparentBackground}
				onResolutionChange={onResolutionChange}
				onTransparentBackgroundChange={onTransparentBackgroundChange}
				onExport={onExport}
			>
				{modelControls}
			</AdjustmentPanel>
			{import.meta.env.DEV && <DebugPanel />}
		</main>
	);
}
