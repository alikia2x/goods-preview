import { Button } from "@/components/ui/button";
import { KEYCHAIN_HARDWARE_COLORS } from "@/lib/keychain/materials";
import type {
	KeychainHardwareColor,
	KeychainSettingChange,
	KeychainSettings,
} from "@/lib/keychain/types";

export function KeychainProductControls({
	settings,
	onChange,
}: {
	settings: Pick<KeychainSettings, "hardware" | "hardwareColor">;
	onChange: KeychainSettingChange;
}) {
	return (
		<div>
			<section className="mb-8 [&_h2]:mb-3 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-[#dedede] max-[700px]:mb-4 max-[700px]:[&_h2]:mb-2">
				<h2>颜色</h2>
				<div className="flex flex-wrap gap-2.5 [&_[data-slot=button]]:flex-1 [&_[data-slot=button]]:px-2.5">
					{(
						Object.keys(KEYCHAIN_HARDWARE_COLORS) as KeychainHardwareColor[]
					).map((color) => (
						<Button
							key={color}
							variant={settings.hardwareColor === color ? "default" : "outline"}
							aria-pressed={settings.hardwareColor === color}
							onClick={() => onChange("hardwareColor", color)}
						>
							<span
								className="size-3 rounded-full border border-[#898989] shadow-[inset_0_0_0_1px_#ffffff55]"
								style={{
									backgroundColor: KEYCHAIN_HARDWARE_COLORS[color].color,
								}}
								aria-hidden="true"
							/>
							{KEYCHAIN_HARDWARE_COLORS[color].label}
						</Button>
					))}
				</div>
			</section>
		</div>
	);
}
