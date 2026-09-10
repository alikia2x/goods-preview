import { Component, type ReactNode } from "react";

export class PreviewErrorBoundary extends Component<
	{ children: ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	render() {
		return this.state.failed ? (
			<div className="canvas-status" role="alert">
				3D 预览初始化失败，请检查浏览器的 WebGL 支持并刷新页面。
			</div>
		) : (
			this.props.children
		);
	}
}
