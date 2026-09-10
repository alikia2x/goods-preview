import type { RefObject } from "react";
import type { SettingChange, Settings } from "@/lib/badge/types";
import { AdjustmentPanel } from "./AdjustmentPanel";
import { ArtworkControls } from "./ArtworkControls";
import { LightDirectionControls } from "./LightDirectionControls";
import { LightingControls } from "./LightingControls";
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
	return (
		<AdjustmentPanel
			label="调整徽章"
			ready={ready}
			busy={busy}
			error={error}
			resolution={resolution}
			onResolutionChange={onResolutionChange}
			onExport={onExport}
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
			<LightingControls
				value={settings.lighting}
				onChange={(value) => onSettingChange("lighting", value)}
			/>
			<LightDirectionControls settings={settings} onChange={onSettingChange} />
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
		</AdjustmentPanel>
	);
}
