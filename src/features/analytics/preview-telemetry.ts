import { useEffect, useRef } from "react";
import {
	trackPreviewFailure,
	trackPreviewReady,
} from "@/features/analytics/events";
import type { ProductKind } from "@/tuning";

// Time from a workspace mounting to its first lit frame. The clock starts when
// the workspace mounts rather than when the document loads, so the number
// describes the 3D pipeline and not the bundle.
export function usePreviewTelemetry(
	product: ProductKind,
	ready: boolean,
	failed: boolean,
) {
	const startedAt = useRef(0);
	if (startedAt.current === 0) startedAt.current = performance.now();
	const reported = useRef(false);
	useEffect(() => {
		if (reported.current) return;
		if (ready) {
			reported.current = true;
			trackPreviewReady(product, performance.now() - startedAt.current);
			return;
		}
		if (failed) {
			reported.current = true;
			trackPreviewFailure(product, "environment", {
				name: "LightingEnvironmentError",
				message: "环境光照加载失败。",
				stack: "",
			});
		}
	}, [product, ready, failed]);
}
