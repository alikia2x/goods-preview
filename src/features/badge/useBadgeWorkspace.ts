import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { useExportState } from "@/hooks/useExportState";
import { useSceneBackground } from "@/hooks/useSceneBackground";
import { DEFAULT_SETTINGS } from "@/features/badge/constants";
import { defaultArtwork } from "@/features/badge/model/artwork";
import type { BadgeShadowHandle } from "@/features/badge/model/BadgeModel";
import { deriveBadgeSettings } from "@/features/badge/settings";
import type { StudioHandle } from "@/features/studio/components/StudioViewport";
import { downloadPng } from "@/features/studio/lib/capture";
import { decodeImage, validateImageFile } from "@/features/studio/lib/image";
import { useSettings } from "@/features/studio/settings";

export function useBadgeWorkspace() {
	const framingRef = useRef<HTMLElement>(null);
	const backgroundRef = useRef<THREE.Group>(null);
	const shadowRef = useRef<BadgeShadowHandle | null>(null);
	const apiRef = useRef<StudioHandle | null>(null);
	const uploadSequenceRef = useRef(0);

	const { settings, setSettings, updateSetting } = useSettings(
		DEFAULT_SETTINGS,
		deriveBadgeSettings,
	);
	const [ready, setReady] = useState(false);
	const [artwork, setArtwork] = useState<
		HTMLImageElement | HTMLCanvasElement | null
	>(null);
	const [thumbnail, setThumbnail] = useState("");
	const [artworkName, setArtworkName] = useState("默认图案");

	// The set and the contact-shadow backdrop are what a transparent export hides.
	const backgroundObjects = useCallback(() => {
		const objects: THREE.Object3D[] = [];
		if (backgroundRef.current) objects.push(backgroundRef.current);
		const surface = shadowRef.current?.surface;
		if (surface) objects.push(surface);
		return objects;
	}, []);

	const renderExport = useCallback(
		async (resolution: number, transparentBackground: boolean) => {
			const api = apiRef.current;
			if (!api) return;
			// Refresh the depth pass so the captured frame matches the viewport.
			shadowRef.current?.render();
			const blob = await api.capture(resolution, transparentBackground);
			downloadPng(
				blob,
				`${settings.finish}-badge-${settings.scene}${transparentBackground ? "-transparent" : ""}-${resolution}x${resolution}.png`,
			);
		},
		[settings.finish, settings.scene],
	);
	const exportState = useExportState({
		exportArtwork: renderExport,
		transparentBackground: settings.transparentBackground,
	});
	const { error, setError } = exportState;

	useSceneBackground(settings.scene);

	useEffect(() => {
		const fallback = defaultArtwork();
		setArtwork(fallback);
		setThumbnail(fallback.toDataURL());
	}, []);

	const uploadArtwork = useCallback(
		async (file?: File) => {
			if (!file) return;
			const sequence = ++uploadSequenceRef.current;
			const validationError = validateImageFile(file);
			if (validationError) {
				setError(validationError);
				return;
			}
			try {
				const image = await decodeImage(file);
				if (sequence !== uploadSequenceRef.current) return;
				setArtwork(image);
				const preview = document.createElement("canvas");
				preview.width = preview.height = 160;
				const context = preview.getContext("2d");
				context?.drawImage(image, 0, 0, 160, 160);
				setThumbnail(preview.toDataURL());
				setArtworkName(file.name);
				setSettings((current) => ({
					...current,
					bleed: DEFAULT_SETTINGS.bleed,
				}));
				setError("");
			} catch (cause) {
				if (sequence === uploadSequenceRef.current) {
					setError(
						cause instanceof Error && cause.message.startsWith("图像像素")
							? cause.message
							: "无法读取这张图片，请重新选择。",
					);
				}
			}
		},
		[setError, setSettings],
	);

	const changeView = useCallback((view: "front" | "angle" | "back") => {
		apiRef.current?.view(view);
	}, []);
	const onViewportReady = useCallback(() => setReady(true), []);

	return {
		framingRef,
		backgroundRef,
		shadowRef,
		apiRef,
		backgroundObjects,
		settings,
		artwork,
		ready,
		error,
		busy: exportState.busy,
		thumbnail,
		artworkName,
		resolution: exportState.resolution,
		updateSetting,
		uploadArtwork,
		changeView,
		onViewportReady,
		setResolution: exportState.setResolution,
		exportArtwork: exportState.exportArtwork,
	};
}
