import type { Finish } from "./finishes";
import type { SceneKind } from "./scenes";
export type Settings = {
	finish: Finish;
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
