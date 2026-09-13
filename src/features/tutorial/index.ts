import { acrylicTutorial } from "@/features/tutorial/tutorials/acrylic";
import { badgeTutorial } from "@/features/tutorial/tutorials/badge";
import { keychainTutorial } from "@/features/tutorial/tutorials/keychain";
import { standeeTutorial } from "@/features/tutorial/tutorials/standee";
import { ticketTutorial } from "@/features/tutorial/tutorials/ticket";
import type { ProductTutorial } from "@/features/tutorial/types";
import type { ProductKind } from "@/tuning";

export {
	TutorialNote,
	TutorialStep,
	TutorialSteps,
} from "@/features/tutorial/blocks";
export type { ProductTutorial } from "@/features/tutorial/types";

// One tutorial per product, keyed by the ids the routes use. A product added
// without its tutorial file does not compile.
export const PRODUCT_TUTORIALS = {
	badge: badgeTutorial,
	ticket: ticketTutorial,
	keychain: keychainTutorial,
	acrylic: acrylicTutorial,
	standee: standeeTutorial,
} satisfies Record<ProductKind, ProductTutorial>;
