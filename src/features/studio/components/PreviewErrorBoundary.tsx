import { Component, type ErrorInfo, type ReactNode } from "react";
import { normalizeError } from "@/features/analytics/errors";
import { trackPreviewFailure } from "@/features/analytics/events";
import { productFromPathname } from "@/app/routes";

// The canvas is one WebGL context and one scene graph: a failure inside it
// cannot be recovered per element, so the boundary swaps the preview for a
// message. The failure itself is reported with its component stack, which is
// what makes a report actionable without reproducing the device.
export class PreviewErrorBoundary extends Component<
	{ children: ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	componentDidCatch(error: Error, info: ErrorInfo) {
		trackPreviewFailure(
			productFromPathname(window.location.pathname),
			"preview_boundary",
			normalizeError(error, "PreviewError"),
			info.componentStack ?? "",
		);
	}
	render() {
		return this.state.failed ? (
			<div
				className="absolute top-1/2 w-full text-center text-status-muted"
				role="alert"
			>
				3D 预览初始化失败，请检查浏览器的 WebGL 支持并刷新页面。
			</div>
		) : (
			this.props.children
		);
	}
}
