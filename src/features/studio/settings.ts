import { useCallback, useReducer } from "react";
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

// One setting change, keyed so the value type follows the key.
type SettingAction<S> = {
	[K in keyof S]: { key: K; value: S[K] };
}[keyof S];

// One settings reducer for every product. `derive` is an optional pure rule that
// reacts to a change (for example the badge's finish also selects a lighting
// preset and gloss) and must be a stable module-level function.
export function useSettings<S extends StudioSettings>(
	defaults: S,
	derive?: (next: S, key: keyof S) => S,
) {
	const reducer = useCallback(
		(state: S, action: SettingAction<S>) => {
			const next = { ...state, [action.key]: action.value };
			return derive ? derive(next, action.key) : next;
		},
		[derive],
	);
	const [settings, dispatch] = useReducer(reducer, defaults, (initial) => ({
		...initial,
	}));
	const updateSetting = useCallback<SettingChange<S>>(
		(key, value) => dispatch({ key, value } as SettingAction<S>),
		[],
	);
	return { settings, updateSetting };
}
