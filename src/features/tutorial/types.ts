import type { ReactNode } from "react";

// One tutorial per product, written in `tutorials/`. The body is JSX, so a
// tutorial can use lists, emphasis and the shared blocks directly — nothing
// here is parsed from a string.
export type ProductTutorial = {
	// Dialog title, and the menu item that opens it.
	title: string;
	// One line under the title. Omitted, the dialog shows the title alone.
	description?: string;
	content: ReactNode;
};
