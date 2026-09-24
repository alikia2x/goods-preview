/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** GA4 stream ID, for example `G-XXXXXXXXXX`. Empty disables analytics. */
	readonly VITE_GA_MEASUREMENT_ID?: string;
	/** Set to exactly `"true"` in a production build to enable analytics. */
	readonly VITE_ANALYTICS_ENABLED?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
