import type { LightingPreset } from "../studio/lighting-presets";
import type { SceneKind } from "../studio/scenes";
import type { Finish } from "./finishes";
export type Settings = {
	finish: Finish;
	lighting: LightingPreset;
	shadow: number;
	scene: SceneKind;
	light: number;
	lightAzimuth: number;
	lightElevation: number;
	gloss: number;
	size: number;
	zoom: number;
	x: number;
	y: number;
};

export type BadgeView = "front" | "angle" | "back";

export type SettingChange = (
	key: keyof Settings,
	value: Settings[keyof Settings],
) => void;
