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
import { AnalyticsProvider } from "@/features/analytics/AnalyticsProvider";
import { RouteErrorBoundary } from "@/features/analytics/RouteErrorBoundary";
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

// A failure while a workspace renders leaves the shell usable: the boundary is
// keyed on the route, so switching products clears the message instead of
// pinning it for the rest of the session.
function RoutedWorkspaces() {
	const { pathname } = useLocation();
	const workspace = (node: React.ReactNode) => (
		<RouteErrorBoundary key={pathname}>
			<Suspense fallback={WORKSPACE_FALLBACK}>{node}</Suspense>
		</RouteErrorBoundary>
	);
	return (
		<Routes>
			<Route
				path="/workspace/ticket"
				element={workspace(<TicketWorkspace />)}
			/>
			<Route path="/" element={<Navigate to="/workspace/badge" replace />} />
			<Route path="/workspace/badge" element={workspace(<BadgeWorkspace />)} />
			<Route
				path="/workspace/keychain"
				element={workspace(<KeychainWorkspace />)}
			/>
			<Route
				path="/workspace/acrylic"
				element={workspace(<AcrylicWorkspace />)}
			/>
			<Route
				path="/workspace/standee"
				element={workspace(<StandeeWorkspace />)}
			/>
			<Route path="*" element={<Navigate to="/workspace/badge" replace />} />
		</Routes>
	);
}

export default function App() {
	useWorkspacePrefetch();
	return (
		<WorkspaceHistoryProvider>
			<BrowserRouter>
				<AnalyticsProvider />
				<DocumentMetadata />
				<RestoredWorkspaceRedirect />
				<WorkspaceArtworkProvider>
					<WorkspaceSupportProvider>
						<RoutedWorkspaces />
					</WorkspaceSupportProvider>
				</WorkspaceArtworkProvider>
			</BrowserRouter>
		</WorkspaceHistoryProvider>
	);
}
