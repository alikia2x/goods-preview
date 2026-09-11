import type { BadgeSettings } from "@/features/badge/settings";
import { FINISHES } from "@/features/badge/model/finishes";
import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import type { SettingChange } from "@/features/studio/settings";

const FINISH_VALUES = ["glossy", "matte"] as const;

export function FinishControls({
	settings,
	onChange,
}: {
	settings: BadgeSettings;
	onChange: SettingChange<BadgeSettings>;
}) {
	return (
		<OptionButtonGroup
			options={FINISH_VALUES}
			value={settings.finish}
			onChange={(finish) => onChange("finish", finish)}
			renderLabel={(finish) => FINISHES[finish].label}
		/>
	);
}
