import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspaceArtwork } from "@/components/workspace/WorkspaceArtwork";
import { useWorkspaceExportState } from "@/components/workspace/WorkspaceContext";
import type { Frame } from "@/features/studio/lib/framing";
import {
	type Outline,
	type OutlineMount,
	traceOutline,
} from "@/features/acrylic/lib/geometry";
import type {
	AcrylicPose,
	AcrylicSheetSettings,
} from "@/features/acrylic/settings";
import {
	readBaseArtwork,
	type BaseArtwork,
} from "@/features/acrylic/lib/base-artwork";
import type { AcrylicWindow } from "@/features/acrylic/lib/window";
import {
	defaultKeychainArtwork,
	type KeychainArtwork,
	readKeychainArtwork,
} from "@/features/keychain/lib/artwork";
import { useWorkspaceHistorySession } from "@/features/history/useWorkspaceHistorySession";
import { type SettingChange, useSettings } from "@/features/studio/settings";
import { decodeImage } from "@/features/studio/lib/image";
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
	poseOf,
}: {
	defaults: S;
	derive?: (next: S, key: keyof S) => S;
	mount: (settings: S) => "keychain" | OutlineMount | null;
	frame: (outline: Outline, settings: S) => Frame;
	filePrefix: string;
	poseOf?: (settings: S) => AcrylicPose;
}) {
	const {
		artworkFile,
		rememberArtwork,
		windowFile,
		rememberWindow,
		clearWindow: forgetWindow,
		baseArtworkFile,
		rememberBaseArtwork,
	} = useWorkspaceArtwork();
	const activeBaseArtworkFile =
		filePrefix === "standee" ? baseArtworkFile : null;
	const {
		framingRef,
		backgroundRef,
		apiRef,
		ready,
		onViewportReady,
		changeView,
		readPose,
		restorePose,
		subscribePose,
	} = useWorkspaceViewport();
	const {
		settings,
		updateSetting: applySetting,
		replaceSettings,
	} = useSettings(defaults, derive);
	const history = useWorkspaceHistorySession({
		product: filePrefix as "keychain" | "acrylic" | "standee",
		artworkFile,
		windowArtworkFile: windowFile,
		baseArtworkFile: activeBaseArtworkFile,
		settings,
		replaceSettings,
		ready,
		readPose,
		subscribePose,
	});
	const [artwork, setArtwork] = useState<KeychainArtwork | null>(null);
	const [windowArtwork, setWindowArtwork] = useState<AcrylicWindow | null>(
		null,
	);
	const [baseArtwork, setBaseArtwork] = useState<BaseArtwork | null>(null);
	const [outline, setOutline] = useState<Outline | null>(null);
	const [loading, setLoading] = useState(false);
	const sequence = useRef(0);
	const windowSequence = useRef(0);
	const baseArtworkSequence = useRef(0);
	const appliedArtworkFile = useRef<File | null>(null);
	const appliedWindowFile = useRef<File | null>(null);
	const appliedBaseArtworkFile = useRef<File | null>(null);
	const restoreOutlineRef = useRef<Outline | null>(null);
	const handledRestorationKeyRef = useRef(0);

	// Export keeps this set in the beauty pass, then isolates its shadow receivers.
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
		onComplete: history.resolveAfterSave,
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
		if (
			!history.restorationKey ||
			handledRestorationKeyRef.current === history.restorationKey
		)
			return;
		handledRestorationKeyRef.current = history.restorationKey;
		restoreOutlineRef.current = outline;
	}, [history.restorationKey, outline]);

	useEffect(() => {
		if (!ready || outline === null || outline === restoreOutlineRef.current)
			return;
		restoreOutlineRef.current = outline;
		restorePose(history.takeRestoredCamera());
	}, [history.takeRestoredCamera, outline, ready, restorePose]);

	useEffect(() => {
		if (!artworkFile) {
			try {
				setArtwork(defaultKeychainArtwork());
			} catch (cause) {
				setError(cause instanceof Error ? cause.message : "无法加载图案。");
			}
			return;
		}
		if (appliedArtworkFile.current === artworkFile) return;
		const token = ++sequence.current;
		setLoading(true);
		void readKeychainArtwork(artworkFile)
			.then(
				(next) => {
					if (token !== sequence.current) return;
					appliedArtworkFile.current = artworkFile;
					setArtwork(next);
					setError("");
				},
				(cause) => {
					if (token !== sequence.current) return;
					try {
						setArtwork(defaultKeychainArtwork());
					} catch {
						// Keep the original conversion error below; it is more actionable.
					}
					setError(cause instanceof Error ? cause.message : "无法读取图片。");
				},
			)
			.finally(() => {
				if (token === sequence.current) setLoading(false);
			});
		return () => {
			if (token === sequence.current) sequence.current++;
		};
	}, [artworkFile, setError]);

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
				appliedArtworkFile.current = file;
				setArtwork(next);
				rememberArtwork(file);
			} catch (cause) {
				if (token === sequence.current)
					setError(cause instanceof Error ? cause.message : "无法读取图片。");
			} finally {
				if (token === sequence.current) setLoading(false);
			}
		},
		[rememberArtwork, setError],
	);

	const uploadWindow = useCallback(
		async (file?: File) => {
			if (!file) return;
			const token = ++windowSequence.current;
			setLoading(true);
			setError("");
			try {
				const [image, prepared] = await Promise.all([
					decodeImage(file),
					readKeychainArtwork(file),
				]);
				if (token !== windowSequence.current) return;
				appliedWindowFile.current = file;
				setWindowArtwork({ artwork: prepared, image });
				updateSetting("windowStrength", defaults.windowStrength);
				rememberWindow(file);
			} catch (cause) {
				if (token === windowSequence.current)
					setError(cause instanceof Error ? cause.message : "无法读取图片。");
			} finally {
				if (token === windowSequence.current) setLoading(false);
			}
		},
		[defaults.windowStrength, rememberWindow, setError, updateSetting],
	);

	const clearWindow = useCallback(() => {
		windowSequence.current++;
		appliedWindowFile.current = null;
		setWindowArtwork(null);
		setLoading(false);
		setError("");
		forgetWindow();
	}, [forgetWindow, setError]);

	const uploadBaseArtwork = useCallback(
		async (file?: File) => {
			if (!file) return;
			const token = ++baseArtworkSequence.current;
			setLoading(true);
			setError("");
			try {
				const next = await readBaseArtwork(file);
				if (token !== baseArtworkSequence.current) return;
				appliedBaseArtworkFile.current = file;
				setBaseArtwork(next);
				rememberBaseArtwork(file);
			} catch (cause) {
				if (token === baseArtworkSequence.current)
					setError(cause instanceof Error ? cause.message : "无法读取图片。");
			} finally {
				if (token === baseArtworkSequence.current) setLoading(false);
			}
		},
		[rememberBaseArtwork, setError],
	);

	// Restores arrive as the remembered base image, just like the sheet artwork
	// and 彩窗 image. Only the standee route consumes this asset.
	useEffect(() => {
		if (!activeBaseArtworkFile) {
			appliedBaseArtworkFile.current = null;
			setBaseArtwork(null);
			return;
		}
		if (appliedBaseArtworkFile.current === activeBaseArtworkFile) return;
		const token = ++baseArtworkSequence.current;
		setLoading(true);
		void readBaseArtwork(activeBaseArtworkFile)
			.then(
				(next) => {
					if (token !== baseArtworkSequence.current) return;
					appliedBaseArtworkFile.current = activeBaseArtworkFile;
					setBaseArtwork(next);
					setError("");
				},
				(cause) => {
					if (token !== baseArtworkSequence.current) return;
					setBaseArtwork(null);
					setError(cause instanceof Error ? cause.message : "无法读取图片。");
				},
			)
			.finally(() => {
				if (token === baseArtworkSequence.current) setLoading(false);
			});
		return () => {
			if (token === baseArtworkSequence.current) baseArtworkSequence.current++;
		};
	}, [activeBaseArtworkFile, setError]);

	// Restores and product switches arrive as the remembered window file, so the
	// sheet picks the window back up wherever the artwork came from.
	useEffect(() => {
		if (!windowFile) {
			appliedWindowFile.current = null;
			setWindowArtwork(null);
			return;
		}
		if (appliedWindowFile.current === windowFile) return;
		const token = ++windowSequence.current;
		setLoading(true);
		void Promise.all([decodeImage(windowFile), readKeychainArtwork(windowFile)])
			.then(
				([image, prepared]) => {
					if (token !== windowSequence.current) return;
					appliedWindowFile.current = windowFile;
					setWindowArtwork({ artwork: prepared, image });
					setError("");
				},
				(cause) => {
					if (token !== windowSequence.current) return;
					setWindowArtwork(null);
					setError(cause instanceof Error ? cause.message : "无法读取图片。");
				},
			)
			.finally(() => {
				if (token === windowSequence.current) setLoading(false);
			});
		return () => {
			if (token === windowSequence.current) windowSequence.current++;
		};
	}, [windowFile, setError]);

	const model = useMemo(
		() =>
			artwork && outline
				? {
						artwork,
						// The printed plane is mapped to the artwork's own raster, which is
						// the frame the window has to be tracked from.
						window: windowArtwork?.image ?? null,
						baseArtwork,
						outline,
					}
				: null,
		[artwork, baseArtwork, outline, windowArtwork],
	);
	const measured = useMemo(
		() => (outline ? frame(outline, settings) : UNMEASURED_FRAME),
		[outline, settings, frame],
	);
	// Only the products that expose a pose read one; the rest stay upright.
	const flat = poseOf ? poseOf(settings) === "flat" : false;

	return {
		settings,
		model,
		windowArtwork,
		baseArtwork,
		frame: measured,
		// Whether the artwork has been measured yet: the camera is seated once
		// more when it has, so the first frame is not left on the placeholder.
		settled: outline !== null,
		flat,
		loading,
		exportState: workspaceExport,
		updateSetting,
		upload,
		uploadWindow,
		uploadBaseArtwork,
		clearWindow,
		framingRef,
		backgroundRef,
		apiRef,
		backgroundObjects,
		onViewportReady,
		changeView,
		readPose,
	};
}
