import {
	ANALYTICS_ENABLED,
	ANALYTICS_MEASUREMENT_ID,
} from "@/features/analytics/config";
import {
	analyticsAllowed,
	subscribeToAnalyticsConsent,
} from "@/features/analytics/consent";
import {
	type AnalyticsEventName,
	type AnalyticsEventParams,
	type AnalyticsParamValue,
	ANALYTICS_PARAM_KEYS,
} from "@/features/analytics/types";

// The only module that knows GA4 exists. Everything else calls `track` with a
// typed event and stays vendor-neutral: swapping or adding a destination means
// editing this file and nothing else.

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

const GTM_SCRIPT_ID = "ga4-loader";
const GTM_SCRIPT_URL = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_MEASUREMENT_ID}`;

let loader: Promise<void> | null = null;
let enabled = false;

// Repeats of the same failure inside this window collapse into one report, which
// keeps an error thrown from a render loop from turning into thousands of hits.
const REPEAT_WINDOW_MS = 1000;
const MAX_RUNTIME_ERRORS_PER_SESSION = 30;
let runtimeErrors = 0;
const recentSignatures = new Map<string, number>();

function scriptPresent() {
	return document.getElementById(GTM_SCRIPT_ID) !== null;
}

function loadLoader() {
	if (loader) return loader;
	loader = new Promise<void>((resolve) => {
		if (scriptPresent()) {
			resolve();
			return;
		}
		const script = document.createElement("script");
		script.id = GTM_SCRIPT_ID;
		script.async = true;
		script.src = GTM_SCRIPT_URL;
		script.addEventListener("load", () => resolve(), { once: true });
		// A blocked loader (ad blocker, offline, mainland network) must not break
		// the app: tracking degrades to nothing and the promise still settles.
		script.addEventListener("error", () => resolve(), { once: true });
		document.head.appendChild(script);
	});
	return loader;
}

function gtag(...args: unknown[]) {
	window.dataLayer = window.dataLayer ?? [];
	// The queue form is what the loader drains. It also means an event sent
	// before the script arrives is not lost.
	window.dataLayer.push(args);
}

/**
 * Turns tracking on for this session: loads the tag, declares Consent Mode, and
 * records the first page view. Safe to call more than once.
 */
export async function setupAnalytics() {
	if (!ANALYTICS_ENABLED) return;
	if (!analyticsAllowed()) {
		if (import.meta.env.DEV)
			console.info("[analytics] 已按用户选择停用，本次会话不发送任何数据。");
		return;
	}
	if (enabled) return;
	enabled = true;

	await loadLoader();
	gtag("js", new Date());
	// Consent Mode is declared before `config`, so the very first ping already
	// reflects the choice instead of being corrected after the fact.
	gtag("consent", {
		analytics_storage: "granted",
		ad_storage: "denied",
		ad_user_data: "denied",
		ad_personalization: "denied",
	});
	gtag("config", ANALYTICS_MEASUREMENT_ID, {
		// This is a single-page app: the router reports page views, so GA4 must
		// not add one of its own on load.
		send_page_view: false,
		// Advertising features stay off; this property is for product decisions.
		allow_google_signals: false,
		allow_ad_personalization_signals: false,
		anonymize_ip: true,
	});

	subscribeToAnalyticsConsent((granted) => {
		gtag("consent", {
			analytics_storage: granted ? "granted" : "denied",
			ad_storage: "denied",
			ad_user_data: "denied",
			ad_personalization: "denied",
		});
	});

	if (import.meta.env.DEV)
		console.info("[analytics] 已启用，事件会记录到 GA4。");
}

function permitted(params: object) {
	const allowed: Record<string, AnalyticsParamValue> = {};
	for (const [key, value] of Object.entries(params)) {
		if (!ANALYTICS_PARAM_KEYS.has(key)) {
			if (import.meta.env.DEV)
				console.warn(`[analytics] 参数 ${key} 不在白名单内，已丢弃。`);
			continue;
		}
		if (value === undefined || value === null || value === "") continue;
		allowed[key] = value as AnalyticsParamValue;
	}
	return allowed;
}

/** Records one event. A no-op with no network access when analytics is off. */
export function track<K extends AnalyticsEventName>(
	name: K,
	params: AnalyticsEventParams<K>,
) {
	if (!ANALYTICS_ENABLED || !enabled) return;

	const payload = permitted(params);
	gtag("event", name, payload);
}

/**
 * Records a failure. Kept separate from `track` because it applies the two
 * guards a failure needs — collapse immediate repeats and cap the session — and
 * because an error thrown inside the reporting path must never escape.
 */
export function trackError<K extends AnalyticsEventName>(
	name: K,
	params: AnalyticsEventParams<K>,
	signature: string,
) {
	if (!ANALYTICS_ENABLED) return;
	if (name === "runtime_error") {
		runtimeErrors += 1;
		if (runtimeErrors > MAX_RUNTIME_ERRORS_PER_SESSION) return;
	}
	const now = Date.now();
	const key = `${name}:${signature}`;
	const last = recentSignatures.get(key);
	if (last !== undefined && now - last < REPEAT_WINDOW_MS) return;
	recentSignatures.set(key, now);
	try {
		track(name, params);
	} catch {
		// Reporting a failure must never become one.
	}
}

/** What the About dialog reads to show the switch's live state. */
export function analyticsOptedOut() {
	return !analyticsAllowed();
}
