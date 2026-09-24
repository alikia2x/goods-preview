import { useCallback, useReducer } from "react";
import {
	settingTelemetrySuppressed,
	trackSettingChange,
} from "@/features/analytics/events";
import type { LightingPreset } from "@/features/studio/lib/lighting-presets";
import type { ProductKind, SceneKind } from "@/tuning";

// The settings every product workspace shares. Products extend this with their
// own knobs; the shared studio controls and the export pipeline operate on this
// base alone, so every product is driven identically. Values live in
// `@/tuning/products`, one complete set per product.
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

// Products other than the badge can be moved within the upright display set.
// Values are physical millimetres; each model converts them to its own authored
// world scale when it is rendered.
export type ProductPositionSettings = StudioSettings & {
	positionOffsetZ: number;
};

export type SettingChange<S> = <K extends keyof S>(key: K, value: S[K]) => void;

// One setting change, keyed so the value type follows the key.
type SettingAction<S> = {
	[K in keyof S]: { key: K; value: S[K] };
}[keyof S];

type ReplaceSettingsAction<S> = { type: "replace"; settings: S };

// Reported by its own export event, so the generic settings report skips it.
export const SETTINGS_TELEMETRY_EXCLUDED_KEYS: ReadonlySet<string> = new Set([
	"transparentBackground",
]);

// One settings reducer for every product. `derive` is an optional pure rule that
// reacts to a change (for example the badge's finish also selects a lighting
// preset and gloss) and must be a stable module-level function.
export function useSettings<S extends StudioSettings>(
	defaults: S,
	derive: ((next: S, key: keyof S) => S) | undefined,
	product: ProductKind,
) {
	const reducer = useCallback(
		(state: S, action: SettingAction<S> | ReplaceSettingsAction<S>) => {
			if ("type" in action) return action.settings;
			const next = { ...state, [action.key]: action.value };
			return derive ? derive(next, action.key) : next;
		},
		[derive],
	);
	const [settings, dispatch] = useReducer(reducer, defaults, (initial) => ({
		...initial,
	}));
	const updateSetting = useCallback<SettingChange<S>>(
		(key, value) => {
			// The key is known here, so one deliberate change is one event: the
			// derived values `derive` adds are not reported as separate changes.
			if (
				!settingTelemetrySuppressed() &&
				!SETTINGS_TELEMETRY_EXCLUDED_KEYS.has(key as string)
			)
				trackSettingChange(product, key as string, value);
			dispatch({ key, value } as SettingAction<S>);
		},
		[product],
	);
	const replaceSettings = useCallback(
		(next: S) =>
			dispatch({
				type: "replace",
				// History created before a setting was introduced may not contain it.
				// Keep the current product defaults as the compatibility base.
				settings: { ...defaults, ...next },
			}),
		[defaults],
	);
	return { settings, updateSetting, replaceSettings };
}
