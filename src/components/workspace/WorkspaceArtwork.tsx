import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useWorkspaceHistory } from "@/features/history/WorkspaceHistory";

type WorkspaceArtworkValue = {
	artworkFile: File | null;
	rememberArtwork: (file: File) => void;
	backArtworkFile: File | null;
	rememberBackArtwork: (file: File) => void;
	windowFile: File | null;
	rememberWindow: (file: File) => void;
	clearWindow: () => void;
	baseArtworkFile: File | null;
	rememberBaseArtwork: (file: File) => void;
	clearBaseArtwork: () => void;
};

const WorkspaceArtworkContext = createContext<WorkspaceArtworkValue | null>(
	null,
);

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

	useEffect(() => {
		if (!startupEntry) return;
		setArtworkFile(
			new File([startupEntry.artwork], startupEntry.artworkName, {
				type: startupEntry.artwork.type,
				lastModified: startupEntry.artworkLastModified,
			}),
		);
		setBackArtworkFile(
			startupEntry.backArtwork
				? new File(
						[startupEntry.backArtwork],
						startupEntry.backArtworkName ?? "背面",
						{
							type: startupEntry.backArtwork.type,
							lastModified: startupEntry.backArtworkLastModified,
						},
					)
				: null,
		);
		// A restored entry that predates the 彩窗 image clears whatever window
		// the previous product was carrying.
		setWindowFile(
			startupEntry.windowArtwork
				? new File(
						[startupEntry.windowArtwork],
						startupEntry.windowArtworkName ?? "彩窗",
						{ type: startupEntry.windowArtwork.type },
					)
				: null,
		);
		setBaseArtworkFile(
			startupEntry.baseArtwork
				? new File(
						[startupEntry.baseArtwork],
						startupEntry.baseArtworkName ?? "底座图案",
						{
							type: startupEntry.baseArtwork.type,
							lastModified: startupEntry.baseArtworkLastModified,
						},
					)
				: null,
		);
	}, [startupEntry]);

	const rememberArtwork = useCallback((file: File) => setArtworkFile(file), []);
	const rememberBackArtwork = useCallback(
		(file: File) => setBackArtworkFile(file),
		[],
	);
	const rememberWindow = useCallback((file: File) => setWindowFile(file), []);
	const clearWindow = useCallback(() => setWindowFile(null), []);
	const rememberBaseArtwork = useCallback(
		(file: File) => setBaseArtworkFile(file),
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
