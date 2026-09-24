import { useEffect, useRef } from "react";
import { trackSettingChange } from "@/features/analytics/events";
import {
	SETTINGS_TELEMETRY_EXCLUDED_KEYS,
	type StudioSettings,
} from "@/features/studio/settings";
import type { ProductKind } from "@/tuning";

// Pointer gestures replace whole settings objects instead of single keys, so a
// per-key report at the call site cannot see them. Watching the object catches
// those and attributes each difference to the key that changed.
export function useSettingsObjectTelemetry<S extends StudioSettings>(
	product: ProductKind,
	settings: S,
) {
	const previous = useRef<S | null>(null);
	useEffect(() => {
		const before = previous.current;
		previous.current = settings;
		if (!before) return;
		for (const key of Object.keys(settings) as Array<keyof S>) {
			if (before[key] === settings[key]) continue;
			if (SETTINGS_TELEMETRY_EXCLUDED_KEYS.has(key as string)) continue;
			trackSettingChange(product, key as string, settings[key]);
		}
	}, [product, settings]);
}
