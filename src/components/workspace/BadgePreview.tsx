import type { RefObject } from "react";
import { useMobile } from "@/hooks/useMobile";
import type { BadgeView, SettingChange, Settings } from "@/lib/badge/types";
import { PreviewToolbar, SizeControl } from "./PreviewToolbar";
import { WorkspaceHeader } from "./WorkspaceHeader";

type BadgePreviewProps = {
	hostRef: RefObject<HTMLDivElement | null>;
	framingRef: RefObject<HTMLElement | null>;
	ready: boolean;
	error: string;
	size: Settings["size"];
	settings: Settings;
	onSettingChange: SettingChange;
	onSizeChange: (size: number) => void;
	onViewChange: (view: BadgeView) => void;
};

export function BadgePreview({
	hostRef,
	framingRef,
	ready,
	error,
	size,
	settings,
	onSettingChange,
	onSizeChange,
	onViewChange,
}: BadgePreviewProps) {
	const mobile = useMobile();
	return (
		<>
			<div className="canvas-host" ref={hostRef} />
			<section className="preview" aria-label="预览工作区" ref={framingRef}>
				<WorkspaceHeader
					settings={settings}
					onSettingChange={onSettingChange}
				/>
				{!ready && !error && (
					<div className="canvas-status">正在准备 3D 预览…</div>
				)}
				{!mobile && (
					<PreviewToolbar onViewChange={onViewChange}>
						<SizeControl size={size} onSizeChange={onSizeChange} />
					</PreviewToolbar>
				)}
			</section>
		</>
	);
}
