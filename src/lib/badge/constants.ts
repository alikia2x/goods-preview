import type { BadgeView, Settings } from "./types";
import pkg from "../../../package.json";

export const PRODUCT_NAME = "覆膜吧唧 · 亮膜";
export const PRODUCT_VERSION = pkg.version;

export const DEFAULT_SETTINGS: Settings = {
	finish: "glossy",
	lighting: "hdr",
	shadow: 26,
	scene: "table",
	light: 72,
	lightAzimuth: 23,
	lightElevation: 48,
	gloss: 75,
	size: 65,
	bleed: 0,
	transparentBackground: false,
};

export const BADGE_SIZES = [32, 44, 58, 65, 75] as const;

export const VIEW_OPTIONS: Array<{ value: BadgeView; label: string }> = [
	{ value: "front", label: "正面" },
	{ value: "angle", label: "立体" },
	{ value: "back", label: "背面" },
];

export const EXPORT_RESOLUTIONS = ["1024", "2048", "4096"] as const;
export const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_IMAGE_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 64_000_000;
