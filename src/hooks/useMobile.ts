import { useSyncExternalStore } from "react";

const query = "(max-width: 700px)";
function subscribe(listener: () => void) {
	const media = window.matchMedia(query);
	media.addEventListener("change", listener);
	return () => media.removeEventListener("change", listener);
}
export function useMobile() {
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	);
}
