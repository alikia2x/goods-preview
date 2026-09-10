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
		<section className="control-section">
			<h2>光照环境</h2>
			<Select
				value={value}
				onValueChange={(value) => onChange(value as LightingPreset)}
			>
				<SelectTrigger className="scene-select" aria-label="光照环境">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
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
