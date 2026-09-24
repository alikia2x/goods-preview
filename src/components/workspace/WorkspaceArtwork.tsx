import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	trackArtworkFailure,
	trackArtworkUpload,
} from "@/features/analytics/events";
import type { AnalyticsSource } from "@/features/analytics/types";
import { measureImage } from "@/features/studio/lib/image";
import { useWorkspaceHistory } from "@/features/history/WorkspaceHistory";

type WorkspaceArtworkValue = {
	artworkFile: File | null;
	rememberArtwork: (file: File, source?: AnalyticsSource) => void;
	backArtworkFile: File | null;
	rememberBackArtwork: (file: File, source?: AnalyticsSource) => void;
	windowFile: File | null;
	rememberWindow: (file: File, source?: AnalyticsSource) => void;
	clearWindow: () => void;
	baseArtworkFile: File | null;
	rememberBaseArtwork: (file: File, source?: AnalyticsSource) => void;
	clearBaseArtwork: () => void;
};

const WorkspaceArtworkContext = createContext<WorkspaceArtworkValue | null>(
	null,
);

// One report per image that reaches a slot, from whichever product remembered
// it. The picture itself stays in the browser: only its kind and coarse size
// are described, and a restored image is labelled as a restore rather than
// counted again as an upload.
function reportArtwork(
	slot: string,
	source: AnalyticsSource,
	file: File | null,
) {
	if (!file) return;
	void measureImage(file).then(
		(measured) => {
			trackArtworkUpload({
				slot,
				source,
				file,
				width: measured?.width,
				height: measured?.height,
			});
		},
		(cause) => {
			trackArtworkFailure(slot, source, "measure");
			if (import.meta.env.DEV) console.warn("[analytics]", cause);
		},
	);
}

// Keep the most recent successful uploads above the routed workspaces. Each
// product still prepares its own texture or cut outline from these originals.
export function WorkspaceArtworkProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [artworkFile, setArtworkFile] = useState<File | null>(null);
	const [backArtworkFile, setBackArtworkFile] = useState<File | null>(null);
	const [windowFile, setWindowFile] = useState<File | null>(null);
	const [baseArtworkFile, setBaseArtworkFile] = useState<File | null>(null);
	const { startupEntry } = useWorkspaceHistory();
	// Rebuilt images are written on every restore; only the first pass belongs to
	// this session's reports.
	const reportedRestoreRef = useRef<number | null>(null);

	useEffect(() => {
		if (!startupEntry) return;
		const restoredArtwork = new File(
			[startupEntry.artwork],
			startupEntry.artworkName,
			{
				type: startupEntry.artwork.type,
				lastModified: startupEntry.artworkLastModified,
			},
		);
		const restoredBackArtwork = startupEntry.backArtwork
			? new File(
					[startupEntry.backArtwork],
					startupEntry.backArtworkName ?? "背面",
					{
						type: startupEntry.backArtwork.type,
						lastModified: startupEntry.backArtworkLastModified,
					},
				)
			: null;
		// A restored entry that predates the 彩窗 image clears whatever window
		// the previous product was carrying.
		const restoredWindow = startupEntry.windowArtwork
			? new File(
					[startupEntry.windowArtwork],
					startupEntry.windowArtworkName ?? "彩窗",
					{ type: startupEntry.windowArtwork.type },
				)
			: null;
		const restoredBaseArtwork = startupEntry.baseArtwork
			? new File(
					[startupEntry.baseArtwork],
					startupEntry.baseArtworkName ?? "底座图案",
					{
						type: startupEntry.baseArtwork.type,
						lastModified: startupEntry.baseArtworkLastModified,
					},
				)
			: null;
		setArtworkFile(restoredArtwork);
		setBackArtworkFile(restoredBackArtwork);
		setWindowFile(restoredWindow);
		setBaseArtworkFile(restoredBaseArtwork);
		if (reportedRestoreRef.current !== startupEntry.id) {
			reportedRestoreRef.current = startupEntry.id ?? null;
			reportArtwork("artwork", "history_restore", restoredArtwork);
			reportArtwork("back", "history_restore", restoredBackArtwork);
			reportArtwork("window", "history_restore", restoredWindow);
			reportArtwork("base", "history_restore", restoredBaseArtwork);
		}
	}, [startupEntry]);

	const rememberArtwork = useCallback(
		(file: File, source: AnalyticsSource = "user") => {
			reportArtwork("artwork", source, file);
			setArtworkFile(file);
		},
		[],
	);
	const rememberBackArtwork = useCallback(
		(file: File, source: AnalyticsSource = "user") => {
			reportArtwork("back", source, file);
			setBackArtworkFile(file);
		},
		[],
	);
	const rememberWindow = useCallback(
		(file: File, source: AnalyticsSource = "user") => {
			reportArtwork("window", source, file);
			setWindowFile(file);
		},
		[],
	);
	const clearWindow = useCallback(() => setWindowFile(null), []);
	const rememberBaseArtwork = useCallback(
		(file: File, source: AnalyticsSource = "user") => {
			reportArtwork("base", source, file);
			setBaseArtworkFile(file);
		},
		[],
	);
	const clearBaseArtwork = useCallback(() => setBaseArtworkFile(null), []);
	const value = useMemo(
		() => ({
			artworkFile,
			rememberArtwork,
			backArtworkFile,
			rememberBackArtwork,
			windowFile,
			rememberWindow,
			clearWindow,
			baseArtworkFile,
			rememberBaseArtwork,
			clearBaseArtwork,
		}),
		[
			artworkFile,
			rememberArtwork,
			backArtworkFile,
			rememberBackArtwork,
			windowFile,
			rememberWindow,
			clearWindow,
			baseArtworkFile,
			rememberBaseArtwork,
			clearBaseArtwork,
		],
	);
	return (
		<WorkspaceArtworkContext.Provider value={value}>
			{children}
		</WorkspaceArtworkContext.Provider>
	);
}

export function useWorkspaceArtwork() {
	const value = useContext(WorkspaceArtworkContext);
	if (!value)
		throw new Error(
			"useWorkspaceArtwork 必须在 WorkspaceArtworkProvider 中使用。",
		);
	return value;
}
