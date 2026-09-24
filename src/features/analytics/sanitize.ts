// Telemetry must not carry anything a person typed, picked or looked at. These
// helpers reduce the values that do travel to bounded, non-identifying shapes.

const MAX_MESSAGE_LENGTH = 500;
const MAX_STACK_LENGTH = 4000;

/** Trims a string to a length GA4 accepts for a parameter. */
export function truncate(value: string, max: number) {
	return value.length > max ? `${value.slice(0, max)}…` : value;
}

/**
 * Drops everything that can carry user data out of a stack or message: absolute
 * URLs keep only their path, and query strings and fragments go away entirely.
 * A `blob:` or `data:` URL never survives.
 */
export function scrubUrl(input: string) {
	return input
		.replace(/blob:[^\s)]+/g, "blob:")
		.replace(/data:[^\s)]+/g, "data:")
		.replace(/(https?:\/\/[^\s)]+)/g, (match) => {
			try {
				const url = new URL(match);
				return `${url.origin}${url.pathname}`;
			} catch {
				return match.split(/[?#]/)[0] ?? match;
			}
		})
		.replace(/[?#][^\s]*/g, "");
}

/** A message safe to upload: scrubbed and bounded. */
export function sanitizeMessage(message: string) {
	return truncate(scrubUrl(message), MAX_MESSAGE_LENGTH);
}

/** A stack safe to upload: scrubbed and bounded. */
export function sanitizeStack(stack: string) {
	return truncate(scrubUrl(stack), MAX_STACK_LENGTH);
}

/**
 * Buckets a byte count. Exact sizes are more precision than a report needs and
 * one more byte of fingerprinting, so only the order of magnitude travels.
 */
export function sizeBucket(bytes: number) {
	if (bytes < 100 * 1024) return "<100KB";
	if (bytes < 1024 * 1024) return "100KB-1MB";
	if (bytes < 5 * 1024 * 1024) return "1-5MB";
	if (bytes < 20 * 1024 * 1024) return "5-20MB";
	return ">20MB";
}

/** Buckets a pixel count the same way. */
export function pixelBucket(width: number, height: number) {
	const pixels = width * height;
	if (pixels < 1_000_000) return "<1MP";
	if (pixels < 4_000_000) return "1-4MP";
	if (pixels < 16_000_000) return "4-16MP";
	if (pixels < 64_000_000) return "16-64MP";
	return ">64MP";
}

/** Only enumerated, short string values belong in a report. */
export function safeValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "number")
		return Number.isFinite(value) ? `${value}` : "";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "string") return truncate(value, 120);
	return "";
}
