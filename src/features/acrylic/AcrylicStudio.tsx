import { type ReactNode, useMemo } from "react";
import { ProductWorkspace } from "@/components/workspace/ProductWorkspace";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import { AcrylicKeyLight } from "@/features/acrylic/AcrylicKeyLight";
import { AcrylicSheetControls } from "@/features/acrylic/AcrylicSheetControls";
import type { BaseArtwork } from "@/features/acrylic/lib/base-artwork";
import type { Outline, OutlineMount } from "@/features/acrylic/lib/geometry";
import { PatternSizePopover } from "@/features/acrylic/PatternSizePopover";
import type {
	AcrylicPose,
	AcrylicSheetSettings,
} from "@/features/acrylic/settings";
import { useAcrylicWorkspace } from "@/features/acrylic/useAcrylicWorkspace";
import {
	ACRYLIC_MAX_DISTANCE,
	ACRYLIC_MIN_DISTANCE,
	acrylicFlatViews,
	acrylicPose,
	acrylicViews,
} from "@/features/acrylic/views";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";
import { usePreviewTelemetry } from "@/features/analytics/preview-telemetry";
import { StudioCanvas } from "@/features/studio/components/StudioCanvas";
import { StudioStatus } from "@/features/studio/components/StudioStatus";
import { studioDistance, type Frame } from "@/features/studio/lib/framing";
import { useStudioEnvironment } from "@/features/studio/useStudioEnvironment";
import {
	ACRYLIC_CAMERA,
	CAMERA,
	PRODUCT_FRAMING_FILL,
	type ProductKind,
	type Vector3Tuple,
} from "@/tuning";

// The one studio the three acrylic products share. Each product supplies its
// identity, its defaults, the parts that make it that product, and how it is
// framed; everything else — canvas, lighting, camera, panel, export — is here.
export function AcrylicStudio<S extends AcrylicSheetSettings>({
	product,
	defaults,
	derive,
	mount,
	frame,
	opening,
	productName,
	variantControls,
	variantContentClassName,
	renderModel,
	poseOf,
	poseControls,
}: {
	product: ProductKind;
	defaults: S;
	derive?: (next: S, key: keyof S) => S;
	mount: (settings: S) => "keychain" | OutlineMount | null;
	frame: (outline: Outline, settings: S) => Frame;
	opening: Vector3Tuple;
	productName: (settings: S) => string;
	variantControls?: ReactNode;
	variantContentClassName?: string;
	renderModel: (
		model: {
			artwork: KeychainArtwork;
			window: HTMLImageElement | HTMLCanvasElement | null;
			baseArtwork: BaseArtwork | null;
			outline: Outline;
		},
		settings: S,
	) => ReactNode;
	/** Reads the product's pose; products without one stay upright. */
	poseOf?: (settings: S) => AcrylicPose;
	poseControls?: ReactNode;
}) {
	const workspace = useAcrylicWorkspace({
		defaults,
		derive,
		mount,
		frame,
		product,
		poseOf,
	});
	const {
		settings,
		model,
		windowArtwork,
		updateSetting,
		exportState,
		frame: measured,
	} = workspace;
	const {
		environment,
		environmentError,
		onEnvironmentReady,
		onEnvironmentError,
	} = useStudioEnvironment(settings.lighting);
	// One report per mount: the time to the first lit frame, or the lighting
	// failure that replaced it.
	usePreviewTelemetry(product, environment !== null, environmentError);

	const distance = studioDistance(
		measured.span,
		CAMERA.fov,
		PRODUCT_FRAMING_FILL[product],
	);
	const flat = workspace.flat;
	const pose = useMemo(
		() =>
			acrylicPose(
				flat ? ACRYLIC_CAMERA.flatOpening : opening,
				measured.center,
				distance,
			),
		[flat, opening, measured.center, distance],
	);
	const views = useMemo(
		() =>
			flat
				? acrylicFlatViews(measured.center, distance)
				: acrylicViews(measured.center, distance),
		[flat, measured.center, distance],
	);
	const name = productName(settings);
	// The camera is seated when the workspace mounts and once more when the artwork
	// has been measured, since until then the frame is a placeholder. Resizing
	// afterwards leaves the view alone — the framing distance changes, but throwing
	// away whatever orbit the user had found would be worse.

	return (
		<WorkspaceProvider
			settings={settings}
			updateSetting={updateSetting}
			exportState={exportState}
			readPose={workspace.readPose}
		>
			<ProductWorkspace
				product={product}
				productName={name}
				variantAriaLabel={variantControls ? `${name}，制品设置` : undefined}
				variantControls={variantControls}
				variantContentClassName={variantContentClassName}
				renderSizeControl={(placement) => (
					<PatternSizePopover
						size={settings.size}
						arrow={placement === "header" ? "down" : "up"}
						align={placement === "header" ? "end" : "start"}
						onSizeChange={(value) => updateSetting("size", value)}
					/>
				)}
				modelControls={
					<AcrylicSheetControls
						thumbnail={model?.artwork.thumbnail ?? ""}
						windowThumbnail={windowArtwork?.artwork.thumbnail ?? ""}
						baseThumbnail={
							product === "standee"
								? (workspace.baseArtwork?.thumbnail ?? "")
								: ""
						}
						loading={workspace.loading}
						onUpload={workspace.upload}
						onWindowUpload={workspace.uploadWindow}
						onWindowClear={workspace.clearWindow}
						onBaseUpload={
							product === "standee" ? workspace.uploadBaseArtwork : undefined
						}
						onBaseClear={
							product === "standee" ? workspace.clearBaseArtwork : undefined
						}
						poseControls={poseControls}
						product={product}
					/>
				}
				panelLabel={`调整${name}`}
				framingRef={workspace.framingRef}
				canvas={
					<StudioCanvas
						settings={settings}
						environment={environment}
						onEnvironmentReady={onEnvironmentReady}
						onEnvironmentError={onEnvironmentError}
						framingRef={workspace.framingRef}
						backgroundRef={workspace.backgroundRef}
						backgroundObjects={workspace.backgroundObjects}
						apiRef={workspace.apiRef}
						onViewportReady={workspace.onViewportReady}
						pose={pose}
						poseKey={`${product}:${workspace.settled}:${flat ? "flat" : "standing"}`}
						views={views}
						minDistance={ACRYLIC_MIN_DISTANCE}
						maxDistance={ACRYLIC_MAX_DISTANCE}
						sceneObjects={
							<AcrylicKeyLight
								preset={settings.lighting}
								shadow={settings.shadow}
								span={measured.span}
								intensity={settings.light}
								azimuth={settings.lightAzimuth}
								elevation={settings.lightElevation}
								scene={settings.scene}
							/>
						}
					>
						{model && renderModel(model, settings)}
					</StudioCanvas>
				}
				overlays={
					<StudioStatus
						environmentReady={environment !== null}
						environmentError={environmentError}
					/>
				}
				onViewChange={workspace.changeView}
			/>
		</WorkspaceProvider>
	);
}
