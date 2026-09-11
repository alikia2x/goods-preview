import type { BadgeSettings, BadgeView } from "@/features/badge/settings";
import pkg from "../../../package.json";

export { EXPORT_RESOLUTIONS } from "@/features/studio/lib/capture";
export {
	MAX_IMAGE_FILE_SIZE,
	MAX_IMAGE_PIXELS,
	SUPPORTED_IMAGE_TYPES,
} from "@/features/studio/lib/image";

export const PRODUCT_VERSION = pkg.version;

export const DEFAULT_SETTINGS: BadgeSettings = {
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
