import { Component, type ErrorInfo, type ReactNode } from "react";
import { normalizeError } from "@/features/analytics/errors";
import { trackRuntimeError } from "@/features/analytics/events";

// Wraps a routed workspace. A product that fails to render reports why and
// shows a way out; the menu, the router and the rest of the app keep working.
export class RouteErrorBoundary extends Component<
	{ children: ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	componentDidCatch(error: Error, info: ErrorInfo) {
		trackRuntimeError(
			`route_boundary${info.componentStack ? "" : ":no_stack"}`,
			normalizeError(error, "WorkspaceRenderError"),
		);
	}
	render() {
		if (!this.state.failed) return this.props.children;
		return (
			<div className="fixed inset-0 grid place-items-center bg-transparent p-6">
				<div className="grid max-w-md gap-4 rounded-3xl bg-panel p-7 text-panel-foreground shadow-[0_24px_80px_#00000040]">
					<h1 className="m-0 text-xl font-semibold text-white">
						工作区加载失败
					</h1>
					<p className="m-0 text-sm leading-6 text-panel-dim">
						这个制品无法打开。请刷新页面重试，或从左上角菜单切换到其他制品。
					</p>
					<button
						type="button"
						className="h-11 rounded-full bg-white text-panel hover:bg-inverse-hover"
						onClick={() => window.location.reload()}
					>
						刷新页面
					</button>
				</div>
			</div>
		);
	}
}
