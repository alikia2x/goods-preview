import type { BadgeView } from "@/features/badge/settings";
import pkg from "../../../package.json";

export { EXPORT_RESOLUTIONS } from "@/features/studio/lib/capture";
export {
	MAX_IMAGE_FILE_SIZE,
	MAX_IMAGE_PIXELS,
	SUPPORTED_IMAGE_TYPES,
} from "@/features/studio/lib/image";

export const PRODUCT_VERSION = pkg.version;

export const BADGE_SIZES = [32, 44, 58, 65, 75] as const;

export const VIEW_OPTIONS: Array<{ value: BadgeView; label: string }> = [
	{ value: "front", label: "正面" },
	{ value: "angle", label: "立体" },
	{ value: "back", label: "背面" },
];
