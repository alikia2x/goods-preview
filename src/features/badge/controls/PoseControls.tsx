import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { BadgePose, BadgeSettings } from "@/features/badge/settings";

const POSE_LABELS: Record<BadgePose, string> = {
	standing: "立起",
	flat: "躺倒",
};
const POSES = Object.keys(POSE_LABELS) as BadgePose[];

export function PoseControls() {
	const { settings, updateSetting } = useWorkspace<BadgeSettings>();
	return (
		<OptionButtonGroup
			options={POSES}
			value={settings.pose}
			onChange={(pose) => updateSetting("pose", pose)}
			renderLabel={(pose) => POSE_LABELS[pose]}
		/>
	);
}
