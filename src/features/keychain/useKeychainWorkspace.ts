import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import type { StudioHandle } from "@/features/studio/components/StudioViewport";
import { useExportState } from "@/hooks/useExportState";
import { useSceneBackground } from "@/hooks/useSceneBackground";
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
import { downloadPng } from "@/features/studio/lib/capture";
import { type SettingChange, useSettings } from "@/features/studio/settings";

export function useKeychainWorkspace() {
	const { settings, updateSetting: applySetting } = useSettings(
		DEFAULT_KEYCHAIN_SETTINGS,
	);
	const [artwork, setArtwork] = useState<KeychainArtwork | null>(null);
	const [outline, setOutline] = useState<Outline | null>(null);
	const [loading, setLoading] = useState(false);
	const [ready, setReady] = useState(false);

	const apiRef = useRef<StudioHandle | null>(null);
	const framingRef = useRef<HTMLElement | null>(null);
	const backgroundRef = useRef<THREE.Group | null>(null);
	const sequence = useRef(0);

	// The set is what a transparent export hides.
	const backgroundObjects = useCallback(() => {
		const object = backgroundRef.current;
		return object ? [object] : [];
	}, []);

	const renderExport = useCallback(
		async (resolution: number, transparentBackground: boolean) => {
			const api = apiRef.current;
			if (!api) return;
			const blob = await api.capture(resolution, transparentBackground);
			downloadPng(
				blob,
				`keychain-${settings.scene}${transparentBackground ? "-transparent" : ""}-${resolution}x${resolution}.png`,
			);
		},
		[settings.scene],
	);
	const exportState = useExportState({
		exportArtwork: renderExport,
		transparentBackground: settings.transparentBackground,
		blocked: loading,
	});
	const { error, setError } = exportState;

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

	const updateSetting = useCallback<SettingChange<KeychainSettings>>(
		(key, value) => {
			applySetting(key, value);
			setError("");
		},
		[applySetting, setError],
	);

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

	const onViewportReady = useCallback(() => setReady(true), []);

	const model = useMemo(
		() => (artwork && outline ? { artwork, outline } : null),
		[artwork, outline],
	);

	return {
		settings,
		model,
		error,
		ready,
		busy: exportState.busy,
		loading,
		resolution: exportState.resolution,
		setResolution: exportState.setResolution,
		updateSetting,
		upload,
		apiRef,
		framingRef,
		backgroundRef,
		backgroundObjects,
		onViewportReady,
		exportArtwork: exportState.exportArtwork,
	};
}
