import type { ProductKind } from "@/tuning";

// Every value a tracker may send. Nothing else is allowed through: the adapter
// filters parameters against ANALYTICS_PARAM_KEYS, so a future edit that passes
// a file name, an object URL or a whole settings snapshot is dropped instead of
// being uploaded. Add a key here and in `events.ts` before using it.
export type AnalyticsParamValue = string | number | boolean | null | undefined;

export type AnalyticsParams = Record<string, AnalyticsParamValue>;

// Where an image came from. A history restore must never be counted as an
// upload, so the source travels with the event.
export type AnalyticsSource = "user" | "history_restore";

// Every event this app can send. The name is the key, the parameters are the
// value, so `track` cannot be called with a misspelled event or a stray field.
export type AnalyticsEventMap = {
	page_view: { route: string; product: ProductKind | "unknown" };
	analytics_consent: { granted: boolean };

	product_view: { product: ProductKind };
	product_select: { from: ProductKind | "unknown"; to: ProductKind };

	artwork_upload: {
		slot: string;
		source: AnalyticsSource;
		mime: string;
		size_bucket: string;
		pixel_bucket: string;
	};
	artwork_failure: {
		slot: string;
		source: AnalyticsSource;
		reason: string;
	};

	preview_ready: { product: ProductKind; duration_ms: number };
	preview_failure: {
		product: ProductKind | "unknown";
		stage: string;
		name: string;
		message: string;
		stack: string;
		component_stack: string;
	};

	export_start: { resolution: number; transparent: boolean };
	export_success: {
		product: ProductKind | "unknown";
		resolution: number;
		transparent: boolean;
		duration_ms: number;
	};
	export_failure: {
		product: ProductKind | "unknown";
		resolution: number;
		transparent: boolean;
		duration_ms: number;
		stage: string;
		name: string;
		message: string;
		stack: string;
	};
	export_setting_change: { resolution: number; transparent: boolean };

	// Every settings key a person can change, reported from the settings reducer.
	setting_change: { product: ProductKind; key: string; value: string };

	history_open: { count: number };
	history_restore: { product: ProductKind };
	history_restore_rejected: { reason: string };
	history_delete: { product: ProductKind };

	view_mode_change: { view: string };
	panel_toggle: { expanded: boolean };
	crop_mask_change: { visible: boolean };
	tutorial_view: { step: string; product: ProductKind | "unknown" };
	about_view: Record<string, never>;
	analytics_opt_out: { granted: boolean };

	// Anything unexpected. Reported with a full stack because the source is
	// public; `stage` says where in the app it came from.
	runtime_error: {
		stage: string;
		name: string;
		message: string;
		stack: string;
	};
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsEventParams<K extends AnalyticsEventName> =
	AnalyticsEventMap[K];

// The complete allowlist of parameter names. A tracker that invents a key gets
// it dropped rather than silently sending whatever it holds.
export const ANALYTICS_PARAM_KEYS: ReadonlySet<string> = new Set<string>([
	"route",
	"product",
	"from",
	"to",
	"enabled",
	"granted",
	"slot",
	"source",
	"mime",
	"size_bucket",
	"pixel_bucket",
	"reason",
	"stage",
	"name",
	"message",
	"stack",
	"component_stack",
	"duration_ms",
	"resolution",
	"transparent",
	"key",
	"value",
	"count",
	"view",
	"expanded",
	"visible",
	"step",
] satisfies Array<keyof AnalyticsEventMap[AnalyticsEventName] | string>);
