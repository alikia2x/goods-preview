import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { ArtworkUploadSection } from "@/components/workspace/ArtworkUploadSection";
import { RangeControl } from "@/components/workspace/RangeControl";
import { StudioControls } from "@/components/workspace/StudioControls";
import type { KeychainSettings } from "@/features/keychain/settings";
import type { SettingChange } from "@/features/studio/settings";

// Everything the keychain panel adds beyond the shared studio controls.
export function KeychainControls({
	settings,
	thumbnail,
	name,
	loading,
	onSettingChange,
	onUpload,
}: {
	settings: KeychainSettings;
	thumbnail: string;
	name: string;
	loading: boolean;
	onSettingChange: SettingChange<KeychainSettings>;
	onUpload: (file?: File) => Promise<void>;
}) {
	return (
		<>
			<ArtworkUploadSection
				thumbnail={thumbnail}
				name={name}
				changeLabel="更换图案"
				uploadLabel="上传图案"
				onUpload={(file) => void onUpload(file)}
				status={<span title={name}>{loading ? "正在生成切边…" : name}</span>}
			/>
			<AdjustmentSection title="亚克力">
				<RangeControl
					label="厚度"
					value={settings.thickness}
					min={2}
					max={5}
					step={0.5}
					display={`${settings.thickness} mm`}
					onChange={(value) => onSettingChange("thickness", value)}
				/>
				<RangeControl
					label="透明留边"
					value={settings.border}
					min={1}
					max={5}
					step={0.5}
					display={`${settings.border} mm`}
					onChange={(value) => onSettingChange("border", value)}
				/>
			</AdjustmentSection>
			<StudioControls
				settings={settings}
				onChange={onSettingChange}
				glossLabel="表面反光"
			/>
		</>
	);
}
