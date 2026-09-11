import { useCallback, useState } from "react";

export function useExportState({
	exportArtwork,
	transparentBackground,
	blocked = false,
}: {
	exportArtwork: (
		resolution: number,
		transparentBackground: boolean,
	) => Promise<void>;
	transparentBackground: boolean;
	blocked?: boolean;
}) {
	const [resolution, setResolution] = useState("2048");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	const run = useCallback(async () => {
		if (blocked || busy) return;
		setBusy(true);
		setError("");
		try {
			await exportArtwork(Number(resolution), transparentBackground);
		} catch {
			setError("导出失败，请降低分辨率后重试。");
		} finally {
			setBusy(false);
		}
	}, [blocked, busy, exportArtwork, resolution, transparentBackground]);

	return {
		resolution,
		setResolution,
		busy,
		error,
		setError,
		exportArtwork: run,
	};
}
