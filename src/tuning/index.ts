import { ACRYLIC_DEFAULTS } from "@/tuning/products/acrylic";
import { BADGE_DEFAULTS } from "@/tuning/products/badge";
import { KEYCHAIN_DEFAULTS } from "@/tuning/products/keychain";
import { STANDEE_DEFAULTS } from "@/tuning/products/standee";

// Every value a person tunes by eye lives under this module, one topic per file.
// Nothing here imports runtime code from the app: the files are data, and the
// features read them.
export * from "@/tuning/camera";
export * from "@/tuning/geometry";
export * from "@/tuning/lighting";
export * from "@/tuning/scenes";

// One complete, flat set of defaults per product. Key order is what the dev
// panel copies back, so it mirrors the file above.
export const PRODUCT_DEFAULTS = {
	badge: BADGE_DEFAULTS,
	keychain: KEYCHAIN_DEFAULTS,
	acrylic: ACRYLIC_DEFAULTS,
	standee: STANDEE_DEFAULTS,
} as const;
export type ProductKind = keyof typeof PRODUCT_DEFAULTS;

// Where a copied snippet belongs and what shape it takes, so the dev panel can
// emit something that pastes back in as-is.
export const PRODUCT_DEFAULT_SOURCES: Record<
	ProductKind,
	{ constant: string; file: string; type: string }
> = {
	badge: {
		constant: "BADGE_DEFAULTS",
		file: "src/tuning/products/badge.ts",
		type: "BadgeSettings",
	},
	keychain: {
		constant: "KEYCHAIN_DEFAULTS",
		file: "src/tuning/products/keychain.ts",
		type: "KeychainSettings",
	},
	acrylic: {
		constant: "ACRYLIC_DEFAULTS",
		file: "src/tuning/products/acrylic.ts",
		type: "AcrylicSettings",
	},
	standee: {
		constant: "STANDEE_DEFAULTS",
		file: "src/tuning/products/standee.ts",
		type: "StandeeSettings",
	},
};
