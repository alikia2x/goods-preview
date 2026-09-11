import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import BadgeWorkspace from "@/pages/BadgeWorkspace";
import { WorkspaceSupportProvider } from "@/components/workspace/WorkspaceSupport";

const KeychainWorkspace = lazy(() => import("@/pages/KeychainWorkspace"));
export default function App() {
	return (
		<BrowserRouter>
			<WorkspaceSupportProvider>
				<Routes>
					<Route
						path="/"
						element={<Navigate to="/workspace/badge" replace />}
					/>
					<Route path="/workspace/badge" element={<BadgeWorkspace />} />
					<Route
						path="/workspace/keychain"
						element={
							<Suspense
								fallback={
									<div className="absolute top-1/2 w-full text-center text-[#777]">
										正在准备工作区…
									</div>
								}
							>
								<KeychainWorkspace />
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
