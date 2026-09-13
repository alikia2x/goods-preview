import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { useWorkspaceArtwork } from "@/components/workspace/WorkspaceArtwork";
import { useWorkspaceExportState } from "@/components/workspace/WorkspaceContext";
import { PRODUCT_DEFAULTS } from "@/tuning";
import { defaultArtwork } from "@/features/badge/model/artwork";
import { useWorkspaceHistorySession } from "@/features/history/useWorkspaceHistorySession";
import { deriveTicketSettings } from "@/features/ticket/settings";
import type { Frame } from "@/features/studio/lib/framing";
import {
	decodeImage,
	imageThumbnail,
	validateImageFile,
} from "@/features/studio/lib/image";
import { useSettings } from "@/features/studio/settings";
import { useExportController } from "@/features/studio/useExportController";
import { useWorkspaceViewport } from "@/features/studio/useWorkspaceViewport";
import { useSceneBackground } from "@/hooks/useSceneBackground";

// Framing before the model has measured itself, so the opening camera has
// somewhere to look. The model reports what the ticket occupies on the first
// layout pass, before anything is painted.
const UNMEASURED_FRAME: Frame = { center: [0, 0, 0], span: 2 };

export function useTicketWorkspace() {
	const { artworkFile, rememberArtwork } = useWorkspaceArtwork();
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
	const uploadSequenceRef = useRef(0);
	const appliedArtworkFileRef = useRef<File | null>(null);
	const restorePlacementRevisionRef = useRef<number | null>(null);
	const handledRestorationKeyRef = useRef(0);
	const [placement, setPlacement] = useState({
		frame: UNMEASURED_FRAME,
		revision: 0,
	});
	// Publish a revision only after the model has completed placement and measured
	// its new bounds. The camera can then use the matching centre and span instead
	// of racing a scene, pose or size setting change with the layout pass.
	const onPlaced = useCallback((next: Frame) => {
		setPlacement((current) => ({
			frame:
				current.frame.center[0] === next.center[0] &&
				current.frame.center[1] === next.center[1] &&
				current.frame.center[2] === next.center[2] &&
				current.frame.span === next.span
					? current.frame
					: next,
			revision: current.revision + 1,
		}));
	}, []);

	const { settings, updateSetting, replaceSettings } = useSettings(
		PRODUCT_DEFAULTS.ticket,
		deriveTicketSettings,
	);
	const history = useWorkspaceHistorySession({
		product: "ticket",
		artworkFile,
		settings,
		replaceSettings,
		ready,
		readPose,
		subscribePose,
	});
	const [artwork, setArtwork] = useState<
		HTMLImageElement | HTMLCanvasElement | null
	>(null);
	const [thumbnail, setThumbnail] = useState("");
	const [artworkName, setArtworkName] = useState("默认图案");

	// Identify scenery separately from the product for export coverage passes.
	const backgroundObjects = useCallback(() => {
		const objects: THREE.Object3D[] = [];
		if (backgroundRef.current) objects.push(backgroundRef.current);
		return objects;
	}, [backgroundRef]);

	const fileName = useCallback(
		(resolution: number, transparent: boolean) =>
			`${settings.finish}-ticket-${settings.scene}${transparent ? "-transparent" : ""}-${resolution}x${resolution}.png`,
		[settings.finish, settings.scene],
	);

	const exportState = useExportController({
		apiRef,
		fileName,
		transparentBackground: settings.transparentBackground,
		onComplete: history.resolveAfterSave,
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
		if (
			!history.restorationKey ||
			handledRestorationKeyRef.current === history.restorationKey
		)
			return;
		handledRestorationKeyRef.current = history.restorationKey;
		restorePlacementRevisionRef.current = placement.revision + 1;
	}, [history.restorationKey, placement.revision]);

	useEffect(() => {
		const restoreAt = restorePlacementRevisionRef.current;
		if (!ready || restoreAt === null || placement.revision < restoreAt) return;
		restorePlacementRevisionRef.current = null;
		restorePose(history.takeRestoredCamera());
	}, [history.takeRestoredCamera, placement.revision, ready, restorePose]);

	useEffect(() => {
		if (!artworkFile) {
			const fallback = defaultArtwork();
			setArtwork(fallback);
			setThumbnail(fallback.toDataURL());
			setArtworkName("默认图案");
			return;
		}
		if (appliedArtworkFileRef.current === artworkFile) return;
		const sequence = ++uploadSequenceRef.current;
		void decodeImage(artworkFile).then(
			(image) => {
				if (sequence !== uploadSequenceRef.current) return;
				appliedArtworkFileRef.current = artworkFile;
				setArtwork(image);
				setThumbnail(imageThumbnail(image));
				setArtworkName(artworkFile.name);
				setError("");
			},
			(cause) => {
				if (sequence !== uploadSequenceRef.current) return;
				const fallback = defaultArtwork();
				setArtwork(fallback);
				setThumbnail(fallback.toDataURL());
				setArtworkName("默认图案");
				setError(cause instanceof Error ? cause.message : "无法读取这张图片。");
			},
		);
		return () => {
			if (sequence === uploadSequenceRef.current) uploadSequenceRef.current++;
		};
	}, [artworkFile, setError]);

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
				appliedArtworkFileRef.current = file;
				setArtwork(image);
				setThumbnail(imageThumbnail(image));
				setArtworkName(file.name);
				rememberArtwork(file);
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
		[rememberArtwork, setError],
	);

	return {
		framingRef,
		backgroundRef,
		apiRef,
		backgroundObjects,
		settings,
		artwork,
		thumbnail,
		artworkName,
		frame: placement.frame,
		placementRevision: placement.revision,
		onPlaced,
		exportState: workspaceExport,
		updateSetting,
		uploadArtwork,
		changeView,
		readPose,
		onViewportReady,
	};
}
