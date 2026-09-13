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
};

const WorkspaceArtworkContext = createContext<WorkspaceArtworkValue | null>(
	null,
);

// Keep the most recent successful upload above the routed workspaces. Each
// product still prepares its own texture or cut outline from this original file.
export function WorkspaceArtworkProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [artworkFile, setArtworkFile] = useState<File | null>(null);
	const { startupEntry } = useWorkspaceHistory();

	useEffect(() => {
		if (!startupEntry) return;
		setArtworkFile(
			new File([startupEntry.artwork], startupEntry.artworkName, {
				type: startupEntry.artwork.type,
				lastModified: startupEntry.artworkLastModified,
			}),
		);
	}, [startupEntry]);

	const rememberArtwork = useCallback((file: File) => setArtworkFile(file), []);
	const value = useMemo(
		() => ({ artworkFile, rememberArtwork }),
		[artworkFile, rememberArtwork],
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
