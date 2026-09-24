// Analytics is on by default and off only when a person turns it off. The flag
// lives in localStorage, is read once per session, and is the single source of
// truth for both the GA4 Consent Mode default and the About dialog's switch.

const OPT_OUT_KEY = "goods-preview.analytics-opt-out";

const listeners = new Set<(granted: boolean) => void>();

function read(): boolean {
	try {
		return window.localStorage.getItem(OPT_OUT_KEY) === "true";
	} catch {
		// Storage can be unavailable in private browsing. Treat that as "no
		// explicit choice" rather than forcing a decision nobody made.
		return false;
	}
}

let optedOut = typeof window === "undefined" ? false : read();

/** True when analytics may run: enabled by the build and not opted out. */
export function analyticsAllowed() {
	return !optedOut;
}

/**
 * Records the choice and notifies the adapter so GA4 consent is updated in the
 * same session, not only on the next load.
 */
export function setAnalyticsOptOut(next: boolean) {
	try {
		if (next) window.localStorage.setItem(OPT_OUT_KEY, "true");
		else window.localStorage.removeItem(OPT_OUT_KEY);
	} catch {
		// The in-memory flag still applies for this session.
	}
	optedOut = next;
	for (const listener of listeners) listener(!next);
}

export function subscribeToAnalyticsConsent(
	listener: (granted: boolean) => void,
) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
