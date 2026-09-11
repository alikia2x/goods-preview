import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWorkspaceExportState } from "@/components/workspace/WorkspaceContext";
import {
	defaultKeychainArtwork,
	type KeychainArtwork,
	readKeychainArtwork,
} from "@/features/keychain/lib/artwork";
import { type Outline, traceOutline } from "@/features/keychain/lib/geometry";
import {
	DEFAULT_KEYCHAIN_SETTINGS,
	type KeychainSettings,
} from "@/features/keychain/settings";
import { type SettingChange, useSettings } from "@/features/studio/settings";
import { useExportController } from "@/features/studio/useExportController";
import { useWorkspaceViewport } from "@/features/studio/useWorkspaceViewport";
import { useSceneBackground } from "@/hooks/useSceneBackground";

export function useKeychainWorkspace() {
	const {
		framingRef,
		backgroundRef,
		apiRef,
		ready,
		onViewportReady,
		changeView,
	} = useWorkspaceViewport();
	const { settings, updateSetting: applySetting } = useSettings(
		DEFAULT_KEYCHAIN_SETTINGS,
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
			`keychain-${settings.scene}${transparent ? "-transparent" : ""}-${resolution}x${resolution}.png`,
		[settings.scene],
	);

	const exportState = useExportController({
		apiRef,
		fileName,
		transparentBackground: settings.transparentBackground,
		blocked: loading,
	});
	const { setError } = exportState;

	const updateSetting = useCallback<SettingChange<KeychainSettings>>(
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

	useEffect(() => {
		if (!artwork) return;
		try {
			setOutline(traceOutline(artwork.mask, settings.border / settings.size));
			setError("");
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "无法生成切边。");
		}
	}, [artwork, settings.border, settings.size, setError]);

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

	return {
		settings,
		model,
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
	};
}
