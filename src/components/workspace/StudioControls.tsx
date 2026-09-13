import type { ReactNode } from "react";
import { LightDirectionControls } from "@/components/workspace/LightDirectionControls";
import { LightingControls } from "@/components/workspace/LightingControls";
import { RangeControl } from "@/components/workspace/RangeControl";
import { SceneControls } from "@/components/workspace/SceneControls";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { StudioSettings } from "@/features/studio/settings";

// The controls every product offers, in one fixed order. Products only vary the
// label of the gloss slider; settings come from the surrounding workspace.
export function StudioControls<S extends StudioSettings>({
	glossLabel,
	afterScene,
	hideGloss = false,
}: {
	glossLabel: string;
	hideGloss?: boolean;
	afterScene?: ReactNode;
}) {
	const { settings, updateSetting } = useWorkspace<S>();
	return (
		<>
			<SceneControls
				value={settings.scene}
				onChange={(value) => updateSetting("scene", value)}
			/>
			{afterScene}
			<LightingControls
				value={settings.lighting}
				onChange={(value) => updateSetting("lighting", value)}
			/>
			<LightDirectionControls
				settings={settings}
				onChange={(key, value) => updateSetting(key, value)}
			/>
			<RangeControl
				label="光照强度"
				value={settings.light}
				onChange={(value) => updateSetting("light", value)}
			/>
			{!hideGloss && (
				<RangeControl
					label={glossLabel}
					value={settings.gloss}
					onChange={(value) => updateSetting("gloss", value)}
				/>
			)}
			<RangeControl
				label="阴影强度"
				value={settings.shadow}
				onChange={(value) => updateSetting("shadow", value)}
			/>
		</>
	);
}
