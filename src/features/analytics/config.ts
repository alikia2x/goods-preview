// Build-time configuration for analytics. Everything here is inert unless a
// production build supplies a measurement ID, so a dev server and a preview
// build never reach the network by accident.

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";

// A GA4 stream ID looks like `G-XXXXXXXXXX`. A malformed value disables the
// adapter instead of injecting a broken tag into every page.
const WELL_FORMED_ID = /^G-[A-Z0-9]{6,}$/i;

const explicitlyEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === "true";

// Analytics is a production concern: `import.meta.env.PROD` gates the whole
// feature so no development session pollutes the property, and so the tag
// loader can be dropped from the dev bundle entirely.
export const ANALYTICS_MEASUREMENT_ID = WELL_FORMED_ID.test(measurementId)
	? measurementId
	: "";

export const ANALYTICS_ENABLED =
	import.meta.env.PROD && explicitlyEnabled && ANALYTICS_MEASUREMENT_ID !== "";

// GA4 measurement IDs and loader hosts. Kept here so the compliance note in the
// About dialog and any future CSP header describe the same two origins.
export const ANALYTICS_ORIGINS = [
	"https://www.googletagmanager.com",
	"https://www.google-analytics.com",
] as const;

// A leaked measurement ID in a dev build would be a bug report about the build
// config, not about the app, so it is worth a warning rather than a failure.
if (import.meta.env.DEV && measurementId && !ANALYTICS_MEASUREMENT_ID) {
	console.warn(
		"[analytics] VITE_GA_MEASUREMENT_ID 不是合法的 GA4 数据流 ID，已忽略。",
	);
}
