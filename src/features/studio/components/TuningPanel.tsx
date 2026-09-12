import { useCallback, useState } from "react";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import {
	AMBIENT_IBL_SHARE,
	CAMERA,
	PRODUCT_DEFAULT_SOURCES,
	PRODUCT_DEFAULTS,
	type ProductKind,
	REFERENCE_IRRADIANCE,
	RIG_RATIO,
} from "@/tuning";
import styles from "@/styles/debug.module.css";

// Dev-only read-out for tuning by eye: adjust in the workspace, then copy what
// you settled on straight back into `src/tuning`. Nothing here is persisted, so
// the app behaves in dev exactly as it does in production.
export function TuningPanel({ product }: { product: ProductKind }) {
	const { settings, readPose } = useWorkspace();
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState<string | null>(null);
	const source = PRODUCT_DEFAULT_SOURCES[product];
	const entries = Object.entries(PRODUCT_DEFAULTS[product]);
	const live = settings as unknown as Record<string, unknown>;
	const devOnly: Array<[string, string | number]> = [
		["环境光占比", AMBIENT_IBL_SHARE],
		["主光占比", RIG_RATIO],
		["曝光基准", REFERENCE_IRRADIANCE],
		["视场角", `${CAMERA.fov}°`],
		["构图留白", CAMERA.framingFill],
	];

	const copy = useCallback(async (label: string, text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(label);
		} catch {
			setCopied(null);
		}
	}, []);

	const copySettings = () => {
		const body = entries
			.map(([key]) => `\t${key}: ${JSON.stringify(live[key])},`)
			.join("\n");
		return copy(
			"设置",
			`// → ${source.file}\nexport const ${source.constant} = {\n${body}\n} satisfies ${source.type};`,
		);
	};

	const copyPose = () => {
		const pose = readPose?.();
		if (!pose) return;
		const offset = pose.position.map(
			(value, index) => value - pose.target[index],
		);
		const distance = Math.hypot(...offset);
		const direction = offset.map((value) => (value / distance).toFixed(3));
		return copy(
			"视角",
			`// → src/tuning/camera.ts\n{ direction: [${direction.join(", ")}], distance: ${distance.toFixed(2)} }`,
		);
	};

	if (!open)
		return (
			<button
				type="button"
				className={styles.tuningToggle}
				onClick={() => setOpen(true)}
			>
				调参
			</button>
		);

	return (
		<aside className={styles.tuningPanel} aria-label="调参">
			<p className={styles.debugRow}>
				<span>{source.constant}</span>
				<button
					type="button"
					className={styles.tuningButton}
					onClick={() => setOpen(false)}
				>
					收起
				</button>
			</p>
			<div className={styles.tuningList}>
				{entries.map(([key]) => (
					<p className={styles.debugRow} key={key}>
						<span>{key}</span>
						<strong>{JSON.stringify(live[key])}</strong>
					</p>
				))}
			</div>
			<div className={styles.tuningList}>
				{devOnly.map(([label, value]) => (
					<p className={styles.debugRow} key={label}>
						<span>{label}</span>
						<strong>{value}</strong>
					</p>
				))}
			</div>
			<div className={styles.tuningActions}>
				<button
					type="button"
					className={styles.tuningButton}
					onClick={copySettings}
				>
					复制设置
				</button>
				<button
					type="button"
					className={styles.tuningButton}
					onClick={copyPose}
					disabled={!readPose}
				>
					复制视角
				</button>
				{copied && <span className={styles.tuningCopied}>已复制{copied}</span>}
			</div>
		</aside>
	);
}
