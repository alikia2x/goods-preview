import { useCallback, useEffect, useRef, useState } from "react";
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
	settings,
	replaceSettings,
	ready,
	readPose,
	subscribePose,
}: {
	product: ProductKind;
	artworkFile: File | null;
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
	const restoredArtworkRef = useRef<{
		name: string;
		lastModified: number;
		size: number;
	} | null>(null);
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
		skipNextSettingsWriteRef.current = true;
		replaceSettings(restoredEntry.settings as S);
		setRestorationKey((current) => current + 1);
		consumeStartupEntry();
	}, [restoredEntry, replaceSettings, consumeStartupEntry]);

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
		async (artwork: File) => {
			if (writeTimerRef.current !== null) {
				window.clearTimeout(writeTimerRef.current);
				writeTimerRef.current = null;
			}
			try {
				const id = await createHistoryEntry({
					product,
					artwork,
					settings: { ...settings },
					camera: readPose(),
				});
				activeIdRef.current = id;
			} catch {
				// Quota and browser privacy failures should not make an otherwise valid
				// upload appear to fail.
			}
		},
		[product, readPose, settings],
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
		void startEntry(artworkFile);
	}, [artworkFile, startEntry, startupEntry]);

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
