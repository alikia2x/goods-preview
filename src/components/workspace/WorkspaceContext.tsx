import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { ExportControlsProps } from "@/components/workspace/ExportControls";
import type { SettingChange, StudioSettings } from "@/features/studio/settings";
import type { useExportState } from "@/hooks/useExportState";

// Everything ExportControls needs, minus the placement flag. Assembled once per
// workspace so the shell and the panel stop threading eight separate props.
export type WorkspaceExportState = Omit<ExportControlsProps, "showDownload">;

export type WorkspaceContextValue<S extends StudioSettings> = {
	settings: S;
	updateSetting: SettingChange<S>;
	exportState: WorkspaceExportState;
};

// The value is stored untyped-by-product; `useWorkspace<S>` narrows it on read.
const WorkspaceContext =
	createContext<WorkspaceContextValue<StudioSettings> | null>(null);

// One provider per workspace. Each product mounts exactly one, so the settings
// read back below always belong to the matching product. The value is widened to
// the base settings type here and narrowed again by `useWorkspace<S>`.
export function WorkspaceProvider<S extends StudioSettings>({
	settings,
	updateSetting,
	exportState,
	children,
}: WorkspaceContextValue<S> & { children: ReactNode }) {
	const value = useMemo(
		() => ({ settings, updateSetting, exportState }),
		[settings, updateSetting, exportState],
	);
	return (
		<WorkspaceContext.Provider
			value={value as unknown as WorkspaceContextValue<StudioSettings>}
		>
			{children}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspace<S extends StudioSettings = StudioSettings>() {
	const value = useContext(WorkspaceContext);
	if (!value) throw new Error("useWorkspace 必须在 WorkspaceProvider 中使用。");
	return value as unknown as WorkspaceContextValue<S>;
}

// Builds the export block the shell consumes, once, instead of repeating the
// eight fields in every workspace hook.
export function useWorkspaceExportState({
	ready,
	exportState,
	transparentBackground,
	updateSetting,
}: {
	ready: boolean;
	exportState: ReturnType<typeof useExportState>;
	transparentBackground: boolean;
	updateSetting: (key: "transparentBackground", value: boolean) => void;
}): WorkspaceExportState {
	const { resolution, setResolution, busy, error, exportArtwork } = exportState;
	const onTransparentBackgroundChange = useMemo(
		() => (value: boolean) => updateSetting("transparentBackground", value),
		[updateSetting],
	);
	return useMemo(
		() => ({
			ready,
			busy,
			error,
			resolution,
			transparentBackground,
			onResolutionChange: setResolution,
			onTransparentBackgroundChange,
			onExport: exportArtwork,
		}),
		[
			ready,
			busy,
			error,
			resolution,
			transparentBackground,
			setResolution,
			onTransparentBackgroundChange,
			exportArtwork,
		],
	);
}
