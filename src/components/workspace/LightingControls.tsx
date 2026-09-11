import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	LIGHTING_PRESETS,
	type LightingPreset,
} from "@/lib/studio/lighting-presets";

export function LightingControls({
	value,
	onChange,
}: {
	value: LightingPreset;
	onChange: (value: LightingPreset) => void;
}) {
	return (
		<section className="mb-8 [&_h2]:mb-3 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-[#dedede] max-[700px]:mb-4 max-[700px]:[&_h2]:mb-2">
			<h2>光照环境</h2>
			<Select
				value={value}
				onValueChange={(value) => onChange(value as LightingPreset)}
			>
				<SelectTrigger
					className="min-h-11 !w-full !rounded-[14px] !px-4"
					aria-label="光照环境"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent className="!rounded-[20px] !bg-[#292929] !p-2.5 shadow-[0_10px_30px_#0003] max-[700px]:select-none">
					{(Object.keys(LIGHTING_PRESETS) as LightingPreset[]).map((key) => (
						<SelectItem key={key} value={key}>
							{LIGHTING_PRESETS[key].label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</section>
	);
}
