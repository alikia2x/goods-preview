import { pageMetadata } from "@/app/pages";
import type { ProductKind } from "@/tuning";

// Route knowledge that more than one feature needs: the product a path belongs
// to, and the metadata copy for it. `App.tsx` keeps the route table itself.

const PRODUCT_ROUTES: Record<string, ProductKind> = {
	"/workspace/badge": "badge",
	"/workspace/ticket": "ticket",
	"/workspace/keychain": "keychain",
	"/workspace/acrylic": "acrylic",
	"/workspace/standee": "standee",
};

/** The product a route shows, or `unknown` for anything unrecognized. */
export function productFromPathname(pathname: string): ProductKind | "unknown" {
	return PRODUCT_ROUTES[pathname] ?? "unknown";
}

export { pageMetadata };
