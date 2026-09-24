import { sanitizeMessage, sanitizeStack } from "@/features/analytics/sanitize";

// The shape every failure is normalized into before it is uploaded. A browser
// error event, a rejected promise and a thrown React render error all end up
// here, so a report can be read without knowing where it came from.
export type NormalizedError = {
	name: string;
	message: string;
	stack: string;
};

const UNKNOWN_ERROR: NormalizedError = {
	name: "UnknownError",
	message: "",
	stack: "",
};

function fromError(error: Error, fallbackName = "Error"): NormalizedError {
	return {
		name: error.name || fallbackName,
		message: sanitizeMessage(error.message ?? ""),
		stack: sanitizeStack(error.stack ?? ""),
	};
}

/**
 * Normalizes anything a failure handler can receive. This app is open source,
 * so the stack is reported in full — it is the fastest way to locate a failure
 * on a device nobody can reproduce — while still being scrubbed of URLs that
 * could carry user data.
 */
export function normalizeError(input: unknown, fallbackName = "Error") {
	if (input instanceof Error) return fromError(input, fallbackName);
	if (input instanceof ErrorEvent) {
		return {
			name: input.error instanceof Error ? input.error.name : fallbackName,
			message: sanitizeMessage(input.message ?? ""),
			stack: sanitizeStack(
				input.error instanceof Error ? (input.error.stack ?? "") : "",
			),
		};
	}
	if (input instanceof PromiseRejectionEvent) {
		return normalizeError(input.reason, "UnhandledRejection");
	}
	if (typeof input === "string") {
		return {
			name: fallbackName,
			message: sanitizeMessage(input),
			stack: "",
		};
	}
	return { ...UNKNOWN_ERROR, name: fallbackName };
}

/**
 * Describes the frame a failure happened in. The route is read from the live
 * location rather than passed down, so a global handler and a component can
 * agree on where the session was.
 */
export function currentRoute() {
	if (typeof window === "undefined") return "/";
	return `${window.location.pathname}${window.location.search}`;
}
