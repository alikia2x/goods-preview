import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { LoadingOverlay } from "@/components/workspace/LoadingOverlay";
import { WorkspaceSupportProvider } from "@/components/workspace/WorkspaceSupport";

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

export default function App() {
	useWorkspacePrefetch();
	return (
		<BrowserRouter>
			<WorkspaceSupportProvider>
				<Routes>
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
		</BrowserRouter>
	);
}
