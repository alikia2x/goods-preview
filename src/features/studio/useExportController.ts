import { type RefObject, useCallback } from "react";
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
			beforeCapture?.();
			const blob = await api.capture(resolution, transparent);
			downloadPng(blob, fileName(resolution, transparent));
			onComplete?.();
		},
		[apiRef, fileName, beforeCapture, onComplete],
	);
	return useExportState({ exportArtwork, transparentBackground, blocked });
}
