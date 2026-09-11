import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import { KEYCHAIN_HARDWARE_COLORS } from "@/features/keychain/lib/materials";
import type { KeychainHardwareColor } from "@/features/keychain/settings";

const HARDWARE_COLORS = Object.keys(
	KEYCHAIN_HARDWARE_COLORS,
) as KeychainHardwareColor[];

export function KeychainProductControls({
	hardwareColor,
	onChange,
}: {
	hardwareColor: KeychainHardwareColor;
	onChange: (value: KeychainHardwareColor) => void;
}) {
	return (
		<OptionButtonGroup
			options={HARDWARE_COLORS}
			value={hardwareColor}
			onChange={onChange}
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
