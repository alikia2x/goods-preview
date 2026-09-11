import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { KEYCHAIN_HARDWARE_COLORS } from "@/features/keychain/lib/materials";
import type {
	KeychainHardwareColor,
	KeychainSettings,
} from "@/features/keychain/settings";

const HARDWARE_COLORS = Object.keys(
	KEYCHAIN_HARDWARE_COLORS,
) as KeychainHardwareColor[];

export function KeychainProductControls() {
	const { settings, updateSetting } = useWorkspace<KeychainSettings>();
	return (
		<OptionButtonGroup
			options={HARDWARE_COLORS}
			value={settings.hardwareColor}
			onChange={(value) => updateSetting("hardwareColor", value)}
			renderLabel={(color) => (
				<>
					<span
						className="size-3 rounded-full border border-swatch-border shadow-[inset_0_0_0_1px_#ffffff55]"
						style={{ backgroundColor: KEYCHAIN_HARDWARE_COLORS[color].color }}
						aria-hidden="true"
					/>
					{KEYCHAIN_HARDWARE_COLORS[color].label}
				</>
			)}
		/>
	);
}
