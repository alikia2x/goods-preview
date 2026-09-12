import { useEffect } from "react";
import { useLocation } from "react-router";
import { pageMetadata } from "@/app/pages";

// A client route change does not reload the document, so the tab title and the
// description are written back from the page table on every navigation.
export function usePageMetadata() {
	const { pathname } = useLocation();
	useEffect(() => {
		const { title, description } = pageMetadata(pathname);
		document.title = title;
		document
			.querySelector('meta[name="description"]')
			?.setAttribute("content", description);
	}, [pathname]);
}
