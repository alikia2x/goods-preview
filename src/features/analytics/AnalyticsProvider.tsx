import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { ANALYTICS_ENABLED } from "@/features/analytics/config";
import { setupAnalytics } from "@/features/analytics/client";
import { normalizeError } from "@/features/analytics/errors";
import {
	trackPageView,
	trackProductSelect,
	trackProductView,
	trackRuntimeError,
} from "@/features/analytics/events";
import { productFromPathname } from "@/app/routes";

// Loads the tag once, reports every route change and every failure that reaches
// the window. Mounted inside the router so it can read the live location.

function useRouteTelemetry() {
	const { pathname } = useLocation();
	const previous = useRef<string | null>(null);
	useEffect(() => {
		if (previous.current === pathname) return;
		const previousPathname = previous.current;
		const product = productFromPathname(pathname);
		trackPageView(pathname, product);
		if (product !== "unknown") {
			trackProductView(product);
			const from = previousPathname
				? productFromPathname(previousPathname)
				: "unknown";
			if (previousPathname !== null && from !== product)
				trackProductSelect(from, product);
		}
		previous.current = pathname;
	}, [pathname]);
}

function useGlobalErrorTelemetry() {
	useEffect(() => {
		const onError = (event: ErrorEvent) => {
			trackRuntimeError("window", normalizeError(event));
		};
		const onRejection = (event: PromiseRejectionEvent) => {
			trackRuntimeError("unhandled_rejection", normalizeError(event));
		};
		window.addEventListener("error", onError);
		window.addEventListener("unhandledrejection", onRejection);
		return () => {
			window.removeEventListener("error", onError);
			window.removeEventListener("unhandledrejection", onRejection);
		};
	}, []);
}

export function AnalyticsProvider() {
	useEffect(() => {
		if (!ANALYTICS_ENABLED) return;
		setupAnalytics();
	}, []);
	useRouteTelemetry();
	useGlobalErrorTelemetry();
	return null;
}
