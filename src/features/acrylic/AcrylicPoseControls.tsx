import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { AcrylicPose, AcrylicSettings } from "@/features/acrylic/settings";

const POSE_LABELS: Record<AcrylicPose, string> = {
	standing: "立起",
	flat: "躺倒",
};
const POSES: AcrylicPose[] = ["standing", "flat"];

export function AcrylicPoseControls() {
	const { settings, updateSetting } = useWorkspace<AcrylicSettings>();
	// The 立放展示 scene presents the sheet upright, so the choice does not apply.
	if (settings.scene === "standing") return null;
	return (
		<AdjustmentSection title="姿态">
			<OptionButtonGroup
				options={POSES}
				value={settings.pose === "flat" ? "flat" : "standing"}
				onChange={(pose) => updateSetting("pose", pose)}
				renderLabel={(pose) => POSE_LABELS[pose]}
			/>
		</AdjustmentSection>
	);
}
