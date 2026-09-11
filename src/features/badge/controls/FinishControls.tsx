import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { FINISHES } from "@/features/badge/model/finishes";
import type { BadgeSettings } from "@/features/badge/settings";

const FINISH_VALUES = ["glossy", "matte"] as const;

export function FinishControls() {
	const { settings, updateSetting } = useWorkspace<BadgeSettings>();
	return (
		<OptionButtonGroup
			options={FINISH_VALUES}
			value={settings.finish}
			onChange={(finish) => updateSetting("finish", finish)}
			renderLabel={(finish) => FINISHES[finish].label}
		/>
	);
}
