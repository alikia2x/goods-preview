import { useCallback, useState } from "react";
import { ORIGINAL_LIGHT_ANGLES } from "@/features/studio/lib/lighting";
import type { LightingPreset } from "@/features/studio/lib/lighting-presets";
import type { SceneKind } from "@/features/studio/lib/scenes";

// The settings every product workspace shares. Products extend this with their
// own knobs; the shared studio controls and the export pipeline operate on this
// base alone, so both products are driven identically.
export type StudioSettings = {
	scene: SceneKind;
	lighting: LightingPreset;
	light: number;
	lightAzimuth: number;
	lightElevation: number;
	shadow: number;
	gloss: number;
	size: number;
	transparentBackground: boolean;
};

// Neutral values; each product ships its own tuned defaults on top of these.
export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
	scene: "table",
	lighting: "hdr",
	light: 50,
	lightAzimuth: ORIGINAL_LIGHT_ANGLES.azimuth,
	lightElevation: ORIGINAL_LIGHT_ANGLES.elevation,
	shadow: 26,
	gloss: 75,
	size: 60,
	transparentBackground: false,
};

export type SettingChange<S> = <K extends keyof S>(key: K, value: S[K]) => void;

// One settings reducer for every product. `derive` is an optional pure rule that
// reacts to a change (for example the badge's finish also selects a lighting
// preset and gloss) and must be a stable module-level function.
export function useSettings<S extends StudioSettings>(
	defaults: S,
	derive?: (next: S, key: keyof S) => S,
) {
	const [settings, setSettings] = useState<S>(() => ({ ...defaults }));
	const updateSetting = useCallback<SettingChange<S>>(
		(key, value) => {
			setSettings((current) => {
				const next = { ...current, [key]: value };
				return derive ? derive(next, key) : next;
			});
		},
		[derive],
	);
	return { settings, setSettings, updateSetting };
}
