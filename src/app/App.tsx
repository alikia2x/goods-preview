import { lazy, Suspense, useEffect } from "react";
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from "react-router";
import { LoadingOverlay } from "@/components/workspace/LoadingOverlay";
import { WorkspaceArtworkProvider } from "@/components/workspace/WorkspaceArtwork";
import { WorkspaceSupportProvider } from "@/components/workspace/WorkspaceSupport";
import {
	WorkspaceHistoryProvider,
	useWorkspaceHistory,
} from "@/features/history/WorkspaceHistory";
import { usePageMetadata } from "@/hooks/usePageMetadata";

const TicketWorkspace = lazy(() => import("@/features/ticket/TicketWorkspace"));
const BadgeWorkspace = lazy(() => import("@/features/badge/BadgeWorkspace"));
const KeychainWorkspace = lazy(
	() => import("@/features/keychain/KeychainWorkspace"),
);

const AcrylicWorkspace = lazy(
	() => import("@/features/acrylic/AcrylicWorkspace"),
);
const StandeeWorkspace = lazy(
	() => import("@/features/acrylic/StandeeWorkspace"),
);

const WORKSPACE_FALLBACK = (
	<LoadingOverlay label="正在准备工作区…" className="fixed inset-0 z-10" />
);

// Both workspaces are small and share one chunk, so warming them once the first
// one has painted makes a product switch need no loading surface at all.
function useWorkspacePrefetch() {
	useEffect(() => {
		const warm = () => {
			void import("@/features/badge/BadgeWorkspace");
			void import("@/features/keychain/KeychainWorkspace");
		};
		const idle = window.requestIdleCallback?.(warm, { timeout: 3000 });
		if (idle === undefined) {
			const timer = setTimeout(warm, 3000);
			return () => clearTimeout(timer);
		}
		return () => window.cancelIdleCallback?.(idle);
	}, []);
}

function DocumentMetadata() {
	usePageMetadata();
	return null;
}

function RestoredWorkspaceRedirect() {
	const { ready, startupEntry } = useWorkspaceHistory();
	const location = useLocation();
	if (!ready) return WORKSPACE_FALLBACK;
	if (!startupEntry) return null;
	const target = `/workspace/${startupEntry.product}`;
	return location.pathname === target ? null : <Navigate to={target} replace />;
}

export default function App() {
	useWorkspacePrefetch();
	return (
		<WorkspaceHistoryProvider>
			<BrowserRouter>
				<DocumentMetadata />
				<RestoredWorkspaceRedirect />
				<WorkspaceArtworkProvider>
					<WorkspaceSupportProvider>
						<Routes>
							<Route
								path="/workspace/ticket"
								element={
									<Suspense fallback={WORKSPACE_FALLBACK}>
										<TicketWorkspace />
									</Suspense>
								}
							/>
							<Route
								path="/"
								element={<Navigate to="/workspace/badge" replace />}
							/>
							<Route
								path="/workspace/badge"
								element={
									<Suspense fallback={WORKSPACE_FALLBACK}>
										<BadgeWorkspace />
									</Suspense>
								}
							/>
							<Route
								path="/workspace/keychain"
								element={
									<Suspense fallback={WORKSPACE_FALLBACK}>
										<KeychainWorkspace />
									</Suspense>
								}
							/>
							<Route
								path="/workspace/acrylic"
								element={
									<Suspense fallback={WORKSPACE_FALLBACK}>
										<AcrylicWorkspace />
									</Suspense>
								}
							/>
							<Route
								path="/workspace/standee"
								element={
									<Suspense fallback={WORKSPACE_FALLBACK}>
										<StandeeWorkspace />
									</Suspense>
								}
							/>
							<Route
								path="*"
								element={<Navigate to="/workspace/badge" replace />}
							/>
						</Routes>
					</WorkspaceSupportProvider>
				</WorkspaceArtworkProvider>
			</BrowserRouter>
		</WorkspaceHistoryProvider>
	);
}
