import { LoadingOverlay } from "@/components/workspace/LoadingOverlay";

// The one load-status overlay. Shown while the environment map is being
// prepared, or when it failed and the product renders without reflections.
export function StudioStatus({
	environmentReady,
	environmentError,
}: {
	environmentReady: boolean;
	environmentError: boolean;
}) {
	if (environmentError)
		return (
			<div
				className="absolute inset-0 grid place-items-center text-status-muted"
				role="alert"
			>
				光照资源加载失败，反射效果已降级。
			</div>
		);
	return (
		<LoadingOverlay
			active={!environmentReady}
			label="正在准备光照…"
			className="pointer-events-none absolute inset-0"
		/>
	);
}
