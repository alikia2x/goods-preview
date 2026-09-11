import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	isLightingPreset,
	LIGHTING_PRESET_KEYS,
	LIGHTING_PRESETS,
	type LightingPreset,
} from "@/features/studio/lib/lighting-presets";

export function LightingControls({
	value,
	onChange,
}: {
	value: LightingPreset;
	onChange: (value: LightingPreset) => void;
}) {
	return (
		<AdjustmentSection title="光照环境">
			<Select
				value={value}
				onValueChange={(next) => {
					if (!isLightingPreset(next)) return;
					onChange(next);
				}}
			>
				<SelectTrigger
					className="min-h-11 w-full! rounded-[14px]! px-4!"
					aria-label="光照环境"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent className="rounded-[20px]! bg-panel! p-2.5! shadow-[0_10px_30px_#0003] max-mobile:select-none">
					{LIGHTING_PRESET_KEYS.map((key) => (
						<SelectItem key={key} value={key}>
							{LIGHTING_PRESETS[key].label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</AdjustmentSection>
	);
}
