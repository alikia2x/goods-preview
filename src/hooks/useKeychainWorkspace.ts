import { useCallback, useEffect, useRef, useState } from "react";
import type { StudioHandle } from "@/components/studio/StudioViewport";
import {
	defaultKeychainArtwork,
	type KeychainArtwork,
	readKeychainArtwork,
} from "@/lib/keychain/artwork";
import { type Outline, traceOutline } from "@/lib/keychain/geometry";
import {
	DEFAULT_KEYCHAIN_SETTINGS,
	type KeychainSettings,
} from "@/lib/keychain/types";
import { downloadPng } from "@/lib/studio/capture";
import { SCENES } from "@/lib/studio/scenes";

export function useKeychainWorkspace() {
	const [settings, setSettings] = useState({ ...DEFAULT_KEYCHAIN_SETTINGS });
	const [model, setModel] = useState<{
		artwork: KeychainArtwork;
		outline: Outline;
	} | null>(null);
	const [error, setError] = useState("");
	const [ready, setReady] = useState(false),
		[busy, setBusy] = useState(false),
		[loading, setLoading] = useState(false);
	const [resolution, setResolution] = useState("2048");
	const apiRef = useRef<StudioHandle | null>(null),
		framingRef = useRef<HTMLElement | null>(null);
	const sequence = useRef(0),
		currentSettings = useRef(settings);
	currentSettings.current = settings;
	useEffect(() => {
		try {
			const artwork = defaultKeychainArtwork();
			setModel({
				artwork,
				outline: traceOutline(
					artwork.mask,
					DEFAULT_KEYCHAIN_SETTINGS.border / DEFAULT_KEYCHAIN_SETTINGS.size,
				),
			});
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "无法加载图案。");
		}
		return () => {
			sequence.current++;
		};
	}, []);
	useEffect(() => {
		const body = document.body.style.backgroundColor,
			root = document.documentElement.style.backgroundColor;
		document.body.style.backgroundColor =
			document.documentElement.style.backgroundColor =
				SCENES[settings.scene].background;
		return () => {
			document.body.style.backgroundColor = body;
			document.documentElement.style.backgroundColor = root;
		};
	}, [settings.scene]);
	const change = useCallback(
		<K extends keyof KeychainSettings>(key: K, value: KeychainSettings[K]) => {
			const next = { ...currentSettings.current, [key]: value };
			try {
				if (model && (key === "border" || key === "size"))
					setModel({
						...model,
						outline: traceOutline(model.artwork.mask, next.border / next.size),
					});
				currentSettings.current = next;
				setSettings(next);
				setError("");
			} catch (cause) {
				setError(cause instanceof Error ? cause.message : "无法生成切边。");
			}
		},
		[model],
	);
	const upload = useCallback(async (file?: File) => {
		if (!file) return;
		const token = ++sequence.current;
		setLoading(true);
		setError("");
		try {
			const artwork = await readKeychainArtwork(file);
			if (token !== sequence.current) return;
			const { border, size } = currentSettings.current;
			setModel({ artwork, outline: traceOutline(artwork.mask, border / size) });
		} catch (cause) {
			if (token === sequence.current)
				setError(cause instanceof Error ? cause.message : "无法读取图片。");
		} finally {
			if (token === sequence.current) setLoading(false);
		}
	}, []);
	const onReady = useCallback(() => setReady(true), []);
	const exportArtwork = useCallback(async () => {
		if (!apiRef.current || busy || loading) return;
		setBusy(true);
		setError("");
		try {
			const blob = await apiRef.current.capture(
				Number(resolution),
				settings.transparentBackground,
			);
			downloadPng(
				blob,
				`keychain-${settings.scene}${settings.transparentBackground ? "-transparent" : ""}-${resolution}x${resolution}.png`,
			);
		} catch {
			setError("导出失败，请降低分辨率后重试。");
		} finally {
			setBusy(false);
		}
	}, [
		busy,
		loading,
		resolution,
		settings.scene,
		settings.transparentBackground,
	]);
	return {
		settings,
		model,
		error,
		ready,
		busy,
		loading,
		resolution,
		setResolution,
		change,
		upload,
		apiRef,
		framingRef,
		onReady,
		exportArtwork,
	};
}
