import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	CONTROL_SECTION_CLASS_NAME,
	OPTION_ROW_CLASS_NAME,
	SELECT_CONTENT_CLASS_NAME,
} from "@/components/workspace/classNames";
import { KEYCHAIN_HARDWARE_COLORS } from "@/lib/keychain/materials";
import type {
	KeychainHardwareColor,
	KeychainSettingChange,
	KeychainSettings,
} from "@/lib/keychain/types";

const HARDWARE_OPTIONS = [
	{ value: "ring", label: "圆环 · 短链" },
	{ value: "clasp", label: "龙虾扣 · 短链" },
] as const;

export function KeychainProductControls({
	settings,
	onChange,
}: {
	settings: Pick<KeychainSettings, "hardware" | "hardwareColor">;
	onChange: KeychainSettingChange;
}) {
	return (
		<div>
			<section className={CONTROL_SECTION_CLASS_NAME}>
				<h2>颜色</h2>
				<div className={OPTION_ROW_CLASS_NAME}>
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
			<section className={CONTROL_SECTION_CLASS_NAME}>
				<h2>连接件</h2>
				<Select
					value={settings.hardware}
					onValueChange={(value) =>
						onChange("hardware", value as KeychainSettings["hardware"])
					}
				>
					<SelectTrigger
						className="min-h-11 w-full rounded-[14px] px-4"
						aria-label="连接件"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent className={SELECT_CONTENT_CLASS_NAME}>
						{HARDWARE_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</section>
		</div>
	);
}
