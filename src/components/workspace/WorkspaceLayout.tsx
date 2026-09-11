import type { ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";
import layoutStyles from "@/styles/workspace.module.css";

export function WorkspaceLayout({
	ariaLabel,
	framingRef,
	canvasHostRef,
	canvas,
	overlays,
	header,
	footer,
}: {
	ariaLabel: string;
	framingRef: RefObject<HTMLElement | null>;
	canvasHostRef?: RefObject<HTMLDivElement | null>;
	canvas?: ReactNode;
	overlays?: ReactNode;
	header: ReactNode;
	footer?: ReactNode;
}) {
	return (
		<>
			<div
				ref={canvasHostRef}
				className={cn(layoutStyles.canvasHost, "fixed inset-0")}
			>
				{canvas}
			</div>
			<section
				ref={framingRef}
				className={cn(layoutStyles.preview, "pointer-events-none")}
				aria-label={ariaLabel}
			>
				{overlays}
				<header
					className={cn(
						layoutStyles.previewHeader,
						"flex items-center justify-between gap-4 max-mobile:gap-2",
					)}
				>
					{header}
				</header>
				{footer ? (
					<footer
						className={cn(
							layoutStyles.previewFooter,
							"flex items-center justify-between gap-4",
						)}
					>
						{footer}
					</footer>
				) : null}
			</section>
		</>
	);
}
