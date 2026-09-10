import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import BadgeWorkspace from "@/pages/BadgeWorkspace";
export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/workspace/badge" replace />} />
				<Route path="/workspace/badge" element={<BadgeWorkspace />} />
				<Route path="*" element={<Navigate to="/workspace/badge" replace />} />
			</Routes>
		</BrowserRouter>
	);
}
