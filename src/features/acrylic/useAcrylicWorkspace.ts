import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspaceExportState } from "@/components/workspace/WorkspaceContext";
import type { Frame } from "@/features/acrylic/lib/frame";
import {
	type Outline,
	type OutlineMount,
	traceOutline,
} from "@/features/acrylic/lib/geometry";
import type { AcrylicSheetSettings } from "@/features/acrylic/settings";
import {
	defaultKeychainArtwork,
	type KeychainArtwork,
	readKeychainArtwork,
} from "@/features/keychain/lib/artwork";
import { type SettingChange, useSettings } from "@/features/studio/settings";
import { useExportController } from "@/features/studio/useExportController";
import { useWorkspaceViewport } from "@/features/studio/useWorkspaceViewport";
import { useSceneBackground } from "@/hooks/useSceneBackground";

// Framing before the artwork has been measured, so the opening camera has
// somewhere to look.
const UNMEASURED_FRAME: Frame = { center: [0, 0.6, 0], span: 3.6 };

// Everything the three acrylic products share: the artwork, the outline cut from
// it, export, and the frame measured off that outline. What differs between them
// is product identity, so it arrives as arguments here rather than as a field
// inside the settings.
export function useAcrylicWorkspace<S extends AcrylicSheetSettings>({
	defaults,
	derive,
	mount,
	frame,
	filePrefix,
}: {
	defaults: S;
	derive?: (next: S, key: keyof S) => S;
	mount: (settings: S) => "keychain" | OutlineMount | null;
	frame: (outline: Outline, settings: S) => Frame;
	filePrefix: string;
}) {
	const {
		framingRef,
		backgroundRef,
		apiRef,
		ready,
		onViewportReady,
		changeView,
		readPose,
	} = useWorkspaceViewport();
	const { settings, updateSetting: applySetting } = useSettings(
		defaults,
		derive,
	);
	const [artwork, setArtwork] = useState<KeychainArtwork | null>(null);
	const [outline, setOutline] = useState<Outline | null>(null);
	const [loading, setLoading] = useState(false);
	const sequence = useRef(0);

	// The set is what a transparent export hides.
	const backgroundObjects = useCallback(() => {
		const object = backgroundRef.current;
		return object ? [object] : [];
	}, [backgroundRef]);

	const fileName = useCallback(
		(resolution: number, transparent: boolean) =>
			`${filePrefix}-${settings.scene}${transparent ? "-transparent" : ""}-${resolution}x${resolution}.png`,
		[settings.scene, filePrefix],
	);

	const exportState = useExportController({
		apiRef,
		fileName,
		transparentBackground: settings.transparentBackground,
		blocked: loading,
	});
	const { setError } = exportState;

	const updateSetting = useCallback<SettingChange<S>>(
		(key, value) => {
			applySetting(key, value);
			setError("");
		},
		[applySetting, setError],
	);

	const workspaceExport = useWorkspaceExportState({
		ready,
		exportState,
		transparentBackground: settings.transparentBackground,
		updateSetting,
	});

	useSceneBackground(settings.scene);

	useEffect(() => {
		try {
			setArtwork(defaultKeychainArtwork());
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "无法加载图案。");
		}
		return () => {
			sequence.current++;
		};
	}, [setError]);

	// Tracing the outline rasterises the artwork and walks its boundary, so it
	// must only run when something that shapes the cut changes — not while a light
	// or shadow slider is being dragged. The key stands in for the descriptor: an
	// equal key means an equivalent cut, while the descriptor itself is rebuilt
	// every render and would re-trace on every frame.
	const mountSpec = mount(settings);
	const mountKey = JSON.stringify(mountSpec);
	const borderRatio = settings.border / settings.size;
	// biome-ignore lint/correctness/useExhaustiveDependencies: keyed on mountKey
	useEffect(() => {
		if (!artwork) return;
		try {
			setOutline(traceOutline(artwork.mask, borderRatio, mountSpec));
			setError("");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "无法生成切边。");
		}
	}, [artwork, borderRatio, mountKey, setError]);

	const upload = useCallback(
		async (file?: File) => {
			if (!file) return;
			const token = ++sequence.current;
			setLoading(true);
			setError("");
			try {
				const next = await readKeychainArtwork(file);
				if (token !== sequence.current) return;
				setArtwork(next);
			} catch (cause) {
				if (token === sequence.current)
					setError(cause instanceof Error ? cause.message : "无法读取图片。");
			} finally {
				if (token === sequence.current) setLoading(false);
			}
		},
		[setError],
	);

	const model = useMemo(
		() => (artwork && outline ? { artwork, outline } : null),
		[artwork, outline],
	);
	const measured = useMemo(
		() => (outline ? frame(outline, settings) : UNMEASURED_FRAME),
		[outline, settings, frame],
	);

	return {
		settings,
		model,
		frame: measured,
		loading,
		exportState: workspaceExport,
		updateSetting,
		upload,
		framingRef,
		backgroundRef,
		apiRef,
		backgroundObjects,
		onViewportReady,
		changeView,
		readPose,
	};
}
