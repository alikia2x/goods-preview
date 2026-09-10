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
import {
	CONTROL_SECTION_CLASS_NAME,
	SCENE_SELECT_CLASS_NAME,
	SELECT_CONTENT_CLASS_NAME,
} from "./classNames";

export function LightingControls({
	value,
	onChange,
}: {
	value: LightingPreset;
	onChange: (value: LightingPreset) => void;
}) {
	return (
		<section className={CONTROL_SECTION_CLASS_NAME}>
			<h2>光照环境</h2>
			<Select
				value={value}
				onValueChange={(value) => onChange(value as LightingPreset)}
			>
				<SelectTrigger
					className={SCENE_SELECT_CLASS_NAME}
					aria-label="光照环境"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent className={SELECT_CONTENT_CLASS_NAME}>
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
