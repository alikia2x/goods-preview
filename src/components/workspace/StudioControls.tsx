import { LightDirectionControls } from "@/components/workspace/LightDirectionControls";
import { LightingControls } from "@/components/workspace/LightingControls";
import { RangeControl } from "@/components/workspace/RangeControl";
import { SceneControls } from "@/components/workspace/SceneControls";
import type { SettingChange, StudioSettings } from "@/features/studio/settings";

// The controls every product offers, in one fixed order. Products only vary the
// label of the gloss slider, so both workspaces render this identical block.
export function StudioControls<S extends StudioSettings>({
	settings,
	onChange,
	glossLabel,
}: {
	settings: S;
	onChange: SettingChange<S>;
	glossLabel: string;
}) {
	return (
		<>
			<SceneControls
				value={settings.scene}
				onChange={(value) => onChange("scene", value)}
			/>
			<LightingControls
				value={settings.lighting}
				onChange={(value) => onChange("lighting", value)}
			/>
			<LightDirectionControls
				settings={settings}
				onChange={(key, value) => onChange(key, value)}
			/>
			<RangeControl
				label="光照强度"
				value={settings.light}
				onChange={(value) => onChange("light", value)}
			/>
			<RangeControl
				label={glossLabel}
				value={settings.gloss}
				onChange={(value) => onChange("gloss", value)}
			/>
			<RangeControl
				label="阴影强度"
				value={settings.shadow}
				onChange={(value) => onChange("shadow", value)}
			/>
		</>
	);
}
