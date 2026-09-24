import { type RefObject, useCallback } from "react";
import { normalizeError } from "@/features/analytics/errors";
import {
	trackExportFailure,
	trackExportStart,
	trackExportSuccess,
} from "@/features/analytics/events";
import { productFromPathname } from "@/app/routes";
import type { StudioHandle } from "@/features/studio/components/StudioViewport";
import { downloadPng } from "@/features/studio/lib/capture";
import { useExportState } from "@/hooks/useExportState";

// The capture-then-download body both products share. `beforeCapture` is where a
// product refreshes anything the captured frame must reflect (the badge's depth
// pass); `fileName` varies per product and per settings.
export function useExportController({
	apiRef,
	fileName,
	transparentBackground,
	blocked = false,
	beforeCapture,
	onComplete,
}: {
	apiRef: RefObject<StudioHandle | null>;
	fileName: (resolution: number, transparent: boolean) => string;
	transparentBackground: boolean;
	blocked?: boolean;
	beforeCapture?: () => void;
	onComplete?: () => void;
}) {
	const exportArtwork = useCallback(
		async (resolution: number, transparent: boolean) => {
			const api = apiRef.current;
			if (!api) return;
			const product = productFromPathname(window.location.pathname);
			const startedAt = performance.now();
			trackExportStart(resolution, transparent);
			try {
				beforeCapture?.();
				const blob = await api.capture(resolution, transparent);
				downloadPng(blob, fileName(resolution, transparent));
				trackExportSuccess({
					product,
					resolution,
					transparent,
					durationMs: performance.now() - startedAt,
				});
				onComplete?.();
			} catch (cause) {
				// The failing step is named because a capture that dies in WebGL and a
				// download the browser refuses need different fixes.
				trackExportFailure({
					product,
					resolution,
					transparent,
					durationMs: performance.now() - startedAt,
					stage: "capture",
					error: normalizeError(cause, "ExportError"),
				});
				throw cause;
			}
		},
		[apiRef, fileName, beforeCapture, onComplete],
	);
	return useExportState({ exportArtwork, transparentBackground, blocked });
}
