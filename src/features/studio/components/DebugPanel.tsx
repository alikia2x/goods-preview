import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import {
	type DebugSnapshot,
	debugSnapshot,
	tickDebug,
} from "@/features/studio/lib/debug-stats";
import styles from "@/styles/debug.module.css";

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
		<aside className={styles.debugPanel} aria-label="调试参数">
			<p
				className={`${styles.debugRow} ${snapshot.contextLost ? styles.debugAlert : ""}`}
			>
				<span>FPS</span>
				<strong>{format(snapshot.fps)}</strong>
			</p>
			<p className={styles.debugRow}>
				<span>帧时</span>
				<strong>{format(snapshot.frameMs, 2)} ms</strong>
			</p>
			<p className={styles.debugRow}>
				<span>Draw calls</span>
				<strong>{snapshot.drawCalls}</strong>
			</p>
			<p className={styles.debugRow}>
				<span>Triangles</span>
				<strong>{snapshot.triangles.toLocaleString()}</strong>
			</p>
			<p className={styles.debugRow}>
				<span>几何 / 纹理</span>
				<strong>
					{snapshot.geometries} / {snapshot.textures}
				</strong>
			</p>
			<p className={styles.debugRow}>
				<span>着色器</span>
				<strong>{snapshot.programs}</strong>
			</p>
			<p
				className={`${styles.debugRow} ${snapshot.contextLost ? styles.debugAlert : ""}`}
			>
				<span>上下文</span>
				<strong>{snapshot.contextLost ? "已丢失" : "正常"}</strong>
			</p>
		</aside>
	);
}
