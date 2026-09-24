import { track, trackError } from "@/features/analytics/client";
import type { AnalyticsSource } from "@/features/analytics/types";
import {
	pixelBucket,
	safeValue,
	sizeBucket,
} from "@/features/analytics/sanitize";
import type { NormalizedError } from "@/features/analytics/errors";
import type { ProductKind } from "@/tuning";

// Domain-level trackers. Components call these instead of `track` so the event
// name and its parameters are decided in one place, and a rename is a compile
// error rather than a silently missing report.

/** Page metadata is not uploaded; only the fact that a route was shown is. */
export function trackPageView(route: string, product: ProductKind | "unknown") {
	track("page_view", { route, product });
}

export function trackProductView(product: ProductKind) {
	track("product_view", { product });
}

export function trackProductSelect(
	from: ProductKind | "unknown",
	to: ProductKind,
) {
	track("product_select", { from, to });
}

/**
 * One image reached a slot. Only its kind and coarse size travel: never the
 * file name, never a thumbnail, never the bytes.
 */
export function trackArtworkUpload({
	slot,
	source,
	file,
	width,
	height,
}: {
	slot: string;
	source: AnalyticsSource;
	file: File;
	width?: number;
	height?: number;
}) {
	track("artwork_upload", {
		slot,
		source,
		mime: file.type || "unknown",
		size_bucket: sizeBucket(file.size),
		pixel_bucket: width && height ? pixelBucket(width, height) : "unknown",
	});
}

export function trackArtworkFailure(
	slot: string,
	source: AnalyticsSource,
	reason: string,
) {
	track("artwork_failure", { slot, source, reason });
}

export function trackPreviewReady(product: ProductKind, durationMs: number) {
	track("preview_ready", {
		product,
		duration_ms: Math.round(durationMs),
	});
}

export function trackPreviewFailure(
	product: ProductKind | "unknown",
	stage: string,
	error: NormalizedError,
	componentStack = "",
) {
	trackError(
		"preview_failure",
		{
			product,
			stage,
			name: error.name,
			message: error.message,
			stack: error.stack,
			component_stack: componentStack,
		},
		`${stage}:${error.name}:${error.message}`,
	);
}

export function trackExportStart(resolution: number, transparent: boolean) {
	track("export_start", { resolution, transparent });
}

export function trackExportSuccess({
	product,
	resolution,
	transparent,
	durationMs,
}: {
	product: ProductKind | "unknown";
	resolution: number;
	transparent: boolean;
	durationMs: number;
}) {
	track("export_success", {
		product,
		resolution,
		transparent,
		duration_ms: Math.round(durationMs),
	});
}

export function trackExportFailure({
	product,
	resolution,
	transparent,
	durationMs,
	stage,
	error,
}: {
	product: ProductKind | "unknown";
	resolution: number;
	transparent: boolean;
	durationMs: number;
	stage: string;
	error: NormalizedError;
}) {
	trackError(
		"export_failure",
		{
			product,
			resolution,
			transparent,
			duration_ms: Math.round(durationMs),
			stage,
			name: error.name,
			message: error.message,
			stack: error.stack,
		},
		`${stage}:${error.name}:${error.message}`,
	);
}

export function trackExportSettingChange(
	resolution: number,
	transparent: boolean,
) {
	track("export_setting_change", { resolution, transparent });
}

/**
 * One settings key changed. Values are only sent when they are short enumerable
 * primitives; a numeric slider reports its number, and nothing reports an
 * object or a string built from user input.
 */
export function trackSettingChange(
	product: ProductKind,
	key: string,
	value: unknown,
) {
	if (settingTelemetrySuppressed()) return;
	const safe = safeValue(value);
	if (safe === "") return;
	track("setting_change", { product, key, value: safe });
}

// A history restore brings back a whole settings object. Its own event already
// describes that, so the settings it restores must not read as tuning activity.
let suppressDepth = 0;

export function suppressSettingTelemetry() {
	suppressDepth += 1;
}

export function settingTelemetrySuppressed() {
	return suppressDepth > 0;
}

export function trackRuntimeError(stage: string, error: NormalizedError) {
	trackError(
		"runtime_error",
		{
			stage,
			name: error.name,
			message: error.message,
			stack: error.stack,
		},
		`${stage}:${error.name}:${error.message}`,
	);
}

export function trackHistoryOpen(count: number) {
	track("history_open", { count });
}

export function trackHistoryRestore(product: ProductKind) {
	track("history_restore", { product });
}

export function trackHistoryRestoreRejected(reason: string) {
	track("history_restore_rejected", { reason });
}

export function trackHistoryDelete(product: ProductKind) {
	track("history_delete", { product });
}

export function trackViewModeChange(view: string) {
	track("view_mode_change", { view });
}

export function trackPanelToggle(expanded: boolean) {
	track("panel_toggle", { expanded });
}

export function trackCropMaskChange(visible: boolean) {
	track("crop_mask_change", { visible });
}

export function trackTutorialView(
	step: string,
	product: ProductKind | "unknown",
) {
	track("tutorial_view", { step, product });
}

export function trackAboutView() {
	track("about_view", {});
}

export function trackAnalyticsOptOut(granted: boolean) {
	track("analytics_opt_out", { granted });
}
