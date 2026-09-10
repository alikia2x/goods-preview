import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { type RefObject, useState } from "react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/useMobile";
import type { SettingChange, Settings } from "@/lib/badge/types";
import { ArtworkControls } from "./ArtworkControls";
import { ExportControls } from "./ExportControls";
import { LightDirectionControls } from "./LightDirectionControls";
import { RangeControl } from "./RangeControl";
import { SceneControls } from "./SceneControls";

type BadgeAdjustmentPanelProps = {
	settings: Settings;
	thumbnail: string;
	artworkName: string;
	inputRef: RefObject<HTMLInputElement | null>;
	ready: boolean;
	error: string;
	busy: boolean;
	resolution: string;
	onSettingChange: SettingChange;
	onResetCrop: () => void;
	onUpload: (file?: File) => Promise<void>;
	onResolutionChange: (value: string) => void;
	onExport: () => Promise<void>;
};

export function BadgeAdjustmentPanel({
	settings,
	thumbnail,
	artworkName,
	inputRef,
	ready,
	error,
	busy,
	resolution,
	onSettingChange,
	onResetCrop,
	onUpload,
	onResolutionChange,
	onExport,
}: BadgeAdjustmentPanelProps) {
	const mobile = useMobile();
	const [expanded, setExpanded] = useState(true);
	return (
		<aside
			data-expanded={!mobile || expanded}
			className="adjust-panel dark"
			aria-label="调整徽章"
		>
			<div className="panel-heading">
				<h1>调整</h1>
				{mobile ? (
					<div className="panel-actions">
						<Button
							className="mobile-download"
							variant="ghost"
							size="icon"
							aria-label={busy ? "正在导出" : "下载 PNG"}
							disabled={!ready || busy}
							onClick={() => void onExport()}
						>
							<Download />
						</Button>
						<Button
							className="panel-toggle"
							variant="ghost"
							size="icon"
							aria-label={expanded ? "收起调整面板" : "展开调整面板"}
							aria-expanded={expanded}
							aria-controls="adjust-controls"
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
			<div
				id="adjust-controls"
				className="panel-scroll"
				hidden={mobile && !expanded}
			>
				<ArtworkControls
					settings={settings}
					thumbnail={thumbnail}
					artworkName={artworkName}
					inputRef={inputRef}
					onSettingChange={onSettingChange}
					onResetCrop={onResetCrop}
					onUpload={onUpload}
				/>
				<SceneControls
					value={settings.scene}
					onChange={(value) => onSettingChange("scene", value)}
				/>
				<LightDirectionControls
					settings={settings}
					onChange={onSettingChange}
				/>
				<RangeControl
					label="光照强度"
					value={settings.light}
					onChange={(value) => onSettingChange("light", value)}
				/>
				<RangeControl
					label="覆膜反光"
					value={settings.gloss}
					onChange={(value) => onSettingChange("gloss", value)}
				/>
				<RangeControl
					label="阴影强度"
					value={settings.shadow}
					onChange={(value) => onSettingChange("shadow", value)}
				/>
				{mobile && (
					<ExportControls
						ready={ready}
						busy={busy}
						error={error}
						resolution={resolution}
						onResolutionChange={onResolutionChange}
						onExport={onExport}
						showDownload={false}
					/>
				)}
			</div>
			{!mobile && (
				<ExportControls
					ready={ready}
					busy={busy}
					error={error}
					resolution={resolution}
					onResolutionChange={onResolutionChange}
					onExport={onExport}
					showDownload={!mobile}
				/>
			)}
		</aside>
	);
}
