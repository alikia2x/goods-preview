import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { useWorkspaceExportState } from "@/components/workspace/WorkspaceContext";
import { DEFAULT_SETTINGS } from "@/features/badge/constants";
import type { BadgeShadowHandle } from "@/features/badge/model/BadgeModel";
import { defaultArtwork } from "@/features/badge/model/artwork";
import { deriveBadgeSettings } from "@/features/badge/settings";
import { decodeImage, validateImageFile } from "@/features/studio/lib/image";
import { useSettings } from "@/features/studio/settings";
import { useExportController } from "@/features/studio/useExportController";
import { useWorkspaceViewport } from "@/features/studio/useWorkspaceViewport";
import { useSceneBackground } from "@/hooks/useSceneBackground";

export function useBadgeWorkspace() {
	const {
		framingRef,
		backgroundRef,
		apiRef,
		ready,
		onViewportReady,
		changeView,
	} = useWorkspaceViewport();
	const shadowRef = useRef<BadgeShadowHandle | null>(null);
	const uploadSequenceRef = useRef(0);

	const { settings, updateSetting } = useSettings(
		DEFAULT_SETTINGS,
		deriveBadgeSettings,
	);
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
	}, [backgroundRef]);

	const beforeCapture = useCallback(() => {
		// Refresh the depth pass so the captured frame matches the viewport.
		shadowRef.current?.render();
	}, []);

	const fileName = useCallback(
		(resolution: number, transparent: boolean) =>
			`${settings.finish}-badge-${settings.scene}${transparent ? "-transparent" : ""}-${resolution}x${resolution}.png`,
		[settings.finish, settings.scene],
	);

	const exportState = useExportController({
		apiRef,
		fileName,
		transparentBackground: settings.transparentBackground,
		beforeCapture,
	});
	const { setError } = exportState;

	const workspaceExport = useWorkspaceExportState({
		ready,
		exportState,
		transparentBackground: settings.transparentBackground,
		updateSetting,
	});

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
				updateSetting("bleed", DEFAULT_SETTINGS.bleed);
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
		[setError, updateSetting],
	);

	return {
		framingRef,
		backgroundRef,
		shadowRef,
		apiRef,
		backgroundObjects,
		settings,
		artwork,
		thumbnail,
		artworkName,
		exportState: workspaceExport,
		updateSetting,
		uploadArtwork,
		changeView,
		onViewportReady,
	};
}
