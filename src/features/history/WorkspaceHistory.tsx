import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	loadLatestUnresolvedHistoryEntry,
	type WorkspaceHistoryEntry,
} from "@/features/history/database";

type WorkspaceHistoryValue = {
	ready: boolean;
	startupEntry: WorkspaceHistoryEntry | null;
	consumeStartupEntry: () => void;
	restoreHistoryEntry: (entry: WorkspaceHistoryEntry) => void;
};

const WorkspaceHistoryContext = createContext<WorkspaceHistoryValue | null>(
	null,
);

export function WorkspaceHistoryProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [ready, setReady] = useState(false);
	const [startupEntry, setStartupEntry] =
		useState<WorkspaceHistoryEntry | null>(null);

	useEffect(() => {
		void loadLatestUnresolvedHistoryEntry()
			.then(setStartupEntry)
			.catch(() => {
				// IndexedDB may be unavailable (for example in private browsing). The
				// editor remains usable without history in that case.
				setStartupEntry(null);
			})
			.finally(() => setReady(true));
	}, []);

	const consumeStartupEntry = useCallback(() => setStartupEntry(null), []);
	const restoreHistoryEntry = useCallback(
		(entry: WorkspaceHistoryEntry) => setStartupEntry(entry),
		[],
	);
	const value = useMemo(
		() => ({
			ready,
			startupEntry,
			consumeStartupEntry,
			restoreHistoryEntry,
		}),
		[ready, startupEntry, consumeStartupEntry, restoreHistoryEntry],
	);
	return (
		<WorkspaceHistoryContext.Provider value={value}>
			{children}
		</WorkspaceHistoryContext.Provider>
	);
}

export function useWorkspaceHistory() {
	const value = useContext(WorkspaceHistoryContext);
	if (!value)
		throw new Error(
			"useWorkspaceHistory 必须在 WorkspaceHistoryProvider 中使用。",
		);
	return value;
}
