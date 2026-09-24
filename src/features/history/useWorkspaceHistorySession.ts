import { useCallback, useEffect, useRef, useState } from "react";
import {
	suppressSettingTelemetry,
	trackHistoryRestore,
} from "@/features/analytics/events";
import type { ViewPose } from "@/features/studio/components/StudioViewport";
import {
	createHistoryEntry,
	resolveHistoryEntry,
	updateHistoryEntry,
} from "@/features/history/database";
import { useWorkspaceHistory } from "@/features/history/WorkspaceHistory";
import type { StudioSettings } from "@/features/studio/settings";
import type { ProductKind } from "@/tuning";

const WRITE_DELAY = 300;
const RESOLVE_DELAY = 2000;

// A session points at one history entry after an upload. Settings and camera
// changes then replace that entry rather than creating noisy intermediate rows.
export function useWorkspaceHistorySession<S extends StudioSettings>({
	product,
	artworkFile,
	backArtworkFile,
	windowArtworkFile,
	baseArtworkFile,
	settings,
	replaceSettings,
	ready,
	readPose,
	subscribePose,
}: {
	product: ProductKind;
	artworkFile: File | null;
	backArtworkFile?: File | null;
	windowArtworkFile?: File | null;
	baseArtworkFile?: File | null;
	settings: S;
	replaceSettings: (next: S) => void;
	ready: boolean;
	readPose: () => ViewPose | null;
	subscribePose: (listener: (pose: ViewPose) => void) => () => void;
}) {
	const { startupEntry, consumeStartupEntry } = useWorkspaceHistory();
	const activeIdRef = useRef<number | null>(null);
	const pendingCameraRef = useRef<ViewPose | null>(null);
	const skipNextSettingsWriteRef = useRef(false);
	const writeTimerRef = useRef<number | null>(null);
	const resolveTimerRef = useRef<number | null>(null);
	const pendingSettingsRef = useRef<Record<string, unknown> | null>(null);
	const pendingCameraWriteRef = useRef<ViewPose | null>(null);
	const handledStartupEntryRef = useRef<number | null>(null);
	const observedArtworkFileRef = useRef<File | null>(null);
	const observedBackArtworkFileRef = useRef<File | null>(null);
	const observedWindowFileRef = useRef<File | null>(null);
	const observedBaseArtworkFileRef = useRef<File | null>(null);
	const restoredArtworkRef = useRef<{
		name: string;
		lastModified: number;
		size: number;
	} | null>(null);
	const restoredBackArtworkRef = useRef<File | null>(null);
	const restoredWindowRef = useRef<File | null>(null);
	const restoredBaseArtworkRef = useRef<File | null>(null);
	const [restorationKey, setRestorationKey] = useState(0);
	const restoredEntry = startupEntry?.product === product ? startupEntry : null;

	const flush = useCallback(() => {
		const id = activeIdRef.current;
		if (!id || !pendingSettingsRef.current) return;
		const settingsToWrite = pendingSettingsRef.current;
		const cameraToWrite = pendingCameraWriteRef.current;
		pendingSettingsRef.current = null;
		pendingCameraWriteRef.current = null;
		void updateHistoryEntry(id, {
			settings: settingsToWrite,
			camera: cameraToWrite,
		}).catch(() => {
			// Persistence is supplemental; a quota error must not interrupt editing.
		});
	}, []);

	const scheduleWrite = useCallback(
		(nextSettings: S, nextCamera: ViewPose | null) => {
			if (!activeIdRef.current) return;
			pendingSettingsRef.current = { ...nextSettings };
			pendingCameraWriteRef.current = nextCamera;
			if (writeTimerRef.current !== null)
				window.clearTimeout(writeTimerRef.current);
			writeTimerRef.current = window.setTimeout(() => {
				writeTimerRef.current = null;
				flush();
			}, WRITE_DELAY);
		},
		[flush],
	);

	useEffect(() => {
		if (!restoredEntry) {
			handledStartupEntryRef.current = null;
			return;
		}
		if (restoredEntry.id === undefined) return;
		if (handledStartupEntryRef.current === restoredEntry.id) return;
		handledStartupEntryRef.current = restoredEntry.id;
		activeIdRef.current = restoredEntry.id;
		pendingCameraRef.current = restoredEntry.camera;
		restoredArtworkRef.current = {
			name: restoredEntry.artworkName,
			lastModified: restoredEntry.artworkLastModified,
			size: restoredEntry.artwork.size,
		};
		restoredBackArtworkRef.current = restoredEntry.backArtwork
			? new File(
					[restoredEntry.backArtwork],
					restoredEntry.backArtworkName ?? "背面",
					{
						type: restoredEntry.backArtwork.type,
						lastModified: restoredEntry.backArtworkLastModified,
					},
				)
			: null;
		restoredWindowRef.current = restoredEntry.windowArtwork
			? new File(
					[restoredEntry.windowArtwork],
					restoredEntry.windowArtworkName ?? "彩窗",
					{ type: restoredEntry.windowArtwork.type },
				)
			: null;
		restoredBaseArtworkRef.current = restoredEntry.baseArtwork
			? new File(
					[restoredEntry.baseArtwork],
					restoredEntry.baseArtworkName ?? "底座图案",
					{
						type: restoredEntry.baseArtwork.type,
						lastModified: restoredEntry.baseArtworkLastModified,
					},
				)
			: null;
		skipNextSettingsWriteRef.current = true;
		// The settings object is about to be replaced wholesale. Its own restore
		// event describes that, so the replacement is excluded from the settings
		// report rather than looking like a person retuning every control.
		suppressSettingTelemetry();
		trackHistoryRestore(product);
		replaceSettings(restoredEntry.settings as S);
		setRestorationKey((current) => current + 1);
		consumeStartupEntry();
	}, [restoredEntry, replaceSettings, consumeStartupEntry, product]);

	useEffect(() => {
		if (skipNextSettingsWriteRef.current) {
			skipNextSettingsWriteRef.current = false;
			return;
		}
		scheduleWrite(settings, readPose());
	}, [settings, readPose, scheduleWrite]);

	useEffect(() => {
		if (!ready) return;
		scheduleWrite(settings, readPose());
		return subscribePose((pose) => scheduleWrite(settings, pose));
	}, [ready, settings, readPose, scheduleWrite, subscribePose]);

	useEffect(
		() => () => {
			if (writeTimerRef.current !== null)
				window.clearTimeout(writeTimerRef.current);
			if (resolveTimerRef.current !== null)
				window.clearTimeout(resolveTimerRef.current);
			flush();
		},
		[flush],
	);

	const startEntry = useCallback(
		async (
			artwork: File,
			backArtwork: File | null,
			windowArtwork: File | null,
		) => {
			if (writeTimerRef.current !== null) {
				window.clearTimeout(writeTimerRef.current);
				writeTimerRef.current = null;
			}
			try {
				const id = await createHistoryEntry({
					product,
					artwork,
					backArtwork,
					windowArtwork,
					baseArtwork: baseArtworkFile ?? null,
					settings: { ...settings },
					camera: readPose(),
				});
				activeIdRef.current = id;
			} catch {
				// Quota and browser privacy failures should not make an otherwise valid
				// upload appear to fail.
			}
		},
		[baseArtworkFile, product, readPose, settings],
	);

	useEffect(() => {
		if (!artworkFile) {
			observedArtworkFileRef.current = null;
			return;
		}
		if (observedArtworkFileRef.current === artworkFile) return;
		observedArtworkFileRef.current = artworkFile;
		// A pending restore supplies its own artwork and settings. Do not turn that
		// into a fresh history row while the route and provider are catching up.
		if (startupEntry) return;
		const restoredArtwork = restoredArtworkRef.current;
		if (
			restoredArtwork &&
			restoredArtwork.name === artworkFile.name &&
			restoredArtwork.lastModified === artworkFile.lastModified &&
			restoredArtwork.size === artworkFile.size
		)
			return;
		restoredArtworkRef.current = null;
		restoredBackArtworkRef.current = null;
		restoredWindowRef.current = null;
		restoredBaseArtworkRef.current = null;
		observedBackArtworkFileRef.current = backArtworkFile ?? null;
		observedWindowFileRef.current = windowArtworkFile ?? null;
		observedBaseArtworkFileRef.current = baseArtworkFile ?? null;
		void startEntry(
			artworkFile,
			backArtworkFile ?? null,
			windowArtworkFile ?? null,
		);
	}, [
		artworkFile,
		baseArtworkFile,
		backArtworkFile,
		windowArtworkFile,
		startEntry,
		startupEntry,
	]);

	// Uploading a window alone also describes a new combination of images, so it
	// gets its own row instead of quietly rewriting the artwork's.
	useEffect(() => {
		const nextWindow = windowArtworkFile ?? null;
		if (observedWindowFileRef.current === nextWindow) return;
		observedWindowFileRef.current = nextWindow;
		if (startupEntry) return;
		const restoredWindow = restoredWindowRef.current;
		if (
			restoredWindow &&
			nextWindow &&
			restoredWindow.name === nextWindow.name &&
			restoredWindow.size === nextWindow.size
		)
			return;
		if (!restoredWindow && !nextWindow) return;
		if (!artworkFile) return;
		restoredBackArtworkRef.current = null;
		restoredWindowRef.current = null;
		observedArtworkFileRef.current = artworkFile;
		observedBackArtworkFileRef.current = backArtworkFile ?? null;
		observedBaseArtworkFileRef.current = baseArtworkFile ?? null;
		void startEntry(artworkFile, backArtworkFile ?? null, nextWindow);
	}, [
		baseArtworkFile,
		backArtworkFile,
		windowArtworkFile,
		artworkFile,
		startEntry,
		startupEntry,
	]);

	// Uploading a base image also describes a new combination of images, so it
	// gets its own history row instead of quietly rewriting the artwork's.
	useEffect(() => {
		const nextBase = baseArtworkFile ?? null;
		if (observedBaseArtworkFileRef.current === nextBase) return;
		observedBaseArtworkFileRef.current = nextBase;
		if (startupEntry) return;
		const restoredBase = restoredBaseArtworkRef.current;
		if (
			restoredBase &&
			nextBase &&
			restoredBase.name === nextBase.name &&
			restoredBase.size === nextBase.size
		)
			return;
		if (!restoredBase && !nextBase) return;
		if (!artworkFile) return;
		restoredBackArtworkRef.current = null;
		restoredBaseArtworkRef.current = null;
		observedArtworkFileRef.current = artworkFile;
		observedBackArtworkFileRef.current = backArtworkFile ?? null;
		observedWindowFileRef.current = windowArtworkFile ?? null;
		void startEntry(
			artworkFile,
			backArtworkFile ?? null,
			windowArtworkFile ?? null,
		);
	}, [
		artworkFile,
		baseArtworkFile,
		backArtworkFile,
		startEntry,
		startupEntry,
		windowArtworkFile,
	]);

	// Uploading a ticket's back image also describes a new combination of images,
	// so it gets its own history row instead of quietly rewriting the ticket's.
	useEffect(() => {
		const nextBack = backArtworkFile ?? null;
		if (observedBackArtworkFileRef.current === nextBack) return;
		observedBackArtworkFileRef.current = nextBack;
		if (startupEntry) return;
		const restoredBack = restoredBackArtworkRef.current;
		if (
			restoredBack &&
			nextBack &&
			restoredBack.name === nextBack.name &&
			restoredBack.size === nextBack.size
		)
			return;
		if (!restoredBack && !nextBack) return;
		if (!artworkFile) return;
		restoredBackArtworkRef.current = null;
		observedArtworkFileRef.current = artworkFile;
		observedWindowFileRef.current = windowArtworkFile ?? null;
		observedBaseArtworkFileRef.current = baseArtworkFile ?? null;
		void startEntry(artworkFile, nextBack, windowArtworkFile ?? null);
	}, [
		artworkFile,
		backArtworkFile,
		baseArtworkFile,
		startEntry,
		startupEntry,
		windowArtworkFile,
	]);

	const takeRestoredCamera = useCallback(() => {
		const camera = pendingCameraRef.current;
		pendingCameraRef.current = null;
		return camera;
	}, []);

	const resolveAfterSave = useCallback(() => {
		const id = activeIdRef.current;
		if (!id) return;
		if (resolveTimerRef.current !== null)
			window.clearTimeout(resolveTimerRef.current);
		resolveTimerRef.current = window.setTimeout(() => {
			resolveTimerRef.current = null;
			flush();
			void resolveHistoryEntry(id).catch(() => {
				// Saving the export itself has already succeeded at this point.
			});
		}, RESOLVE_DELAY);
	}, [flush]);

	return {
		startEntry,
		takeRestoredCamera,
		resolveAfterSave,
		restorationKey,
	};
}
