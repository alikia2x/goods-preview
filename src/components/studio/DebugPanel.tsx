import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import {
	type DebugSnapshot,
	debugSnapshot,
	tickDebug,
} from "@/lib/studio/debug-stats";

// Feeds the shared collector from inside the R3F loop; mounted only in dev.
export function DebugCollector() {
	const gl = useThree((state) => state.gl);
	useFrame(() => tickDebug(gl));
	return null;
}

function format(n: number, digits = 1) {
	return n.toFixed(digits);
}

export function DebugPanel() {
	const [snapshot, setSnapshot] = useState<DebugSnapshot>(debugSnapshot);
	useEffect(() => {
		const interval = setInterval(() => setSnapshot({ ...debugSnapshot }), 250);
		return () => clearInterval(interval);
	}, []);
	return (
		<aside className="debug-panel" aria-label="调试参数">
			<p className={`debug-row ${snapshot.contextLost ? "debug-alert" : ""}`}>
				<span>FPS</span>
				<strong>{format(snapshot.fps)}</strong>
			</p>
			<p className="debug-row">
				<span>帧时</span>
				<strong>{format(snapshot.frameMs, 2)} ms</strong>
			</p>
			<p className="debug-row">
				<span>Draw calls</span>
				<strong>{snapshot.drawCalls}</strong>
			</p>
			<p className="debug-row">
				<span>Triangles</span>
				<strong>{snapshot.triangles.toLocaleString()}</strong>
			</p>
			<p className="debug-row">
				<span>几何 / 纹理</span>
				<strong>
					{snapshot.geometries} / {snapshot.textures}
				</strong>
			</p>
			<p className="debug-row">
				<span>着色器</span>
				<strong>{snapshot.programs}</strong>
			</p>
			<p className={`debug-row ${snapshot.contextLost ? "debug-alert" : ""}`}>
				<span>上下文</span>
				<strong>{snapshot.contextLost ? "已丢失" : "正常"}</strong>
			</p>
		</aside>
	);
}
