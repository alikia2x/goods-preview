import { ArtworkControls } from "@/features/badge/controls/ArtworkControls";
import type { BadgeSettings } from "@/features/badge/settings";
import { StudioControls } from "@/components/workspace/StudioControls";
import type { SettingChange } from "@/features/studio/settings";

// Everything the badge panel adds beyond the shared studio controls.
export function BadgeControls({
	settings,
	thumbnail,
	artworkName,
	onSettingChange,
	onUpload,
}: {
	settings: BadgeSettings;
	thumbnail: string;
	artworkName: string;
	onSettingChange: SettingChange<BadgeSettings>;
	onUpload: (file?: File) => Promise<void>;
}) {
	return (
		<>
			<ArtworkControls
				settings={settings}
				thumbnail={thumbnail}
				artworkName={artworkName}
				onSettingChange={onSettingChange}
				onUpload={onUpload}
			/>
			<StudioControls
				settings={settings}
				onChange={onSettingChange}
				glossLabel="覆膜反光"
			/>
		</>
	);
}
