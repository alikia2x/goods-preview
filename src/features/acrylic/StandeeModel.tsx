import { AcrylicSheet } from "@/features/acrylic/AcrylicSheet";
import type { BaseArtwork } from "@/features/acrylic/lib/base-artwork";
import type { Outline } from "@/features/acrylic/lib/geometry";
import type { StandeeSettings } from "@/features/acrylic/settings";
import { StandeeBase } from "@/features/acrylic/StandeeBase";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";

// 亚克力立牌：the sheet seated in its base.
export function StandeeModel({
	artwork,
	window,
	baseArtwork,
	outline,
	settings,
}: {
	artwork: KeychainArtwork;
	window?: HTMLImageElement | HTMLCanvasElement | null;
	baseArtwork?: BaseArtwork | null;
	outline: Outline;
	settings: StandeeSettings;
}) {
	const bottom = Math.min(...outline.points.map((point) => point.y));
	return (
		<AcrylicSheet
			artwork={artwork}
			window={window}
			outline={outline}
			size={settings.size}
			thickness={settings.thickness}
			gloss={settings.gloss}
			windowStrength={settings.windowStrength}
			scene={settings.scene}
			positionOffsetZ={settings.positionOffsetZ}
		>
			<StandeeBase
				baseDiameter={settings.baseDiameter}
				artwork={baseArtwork}
				connectorHeight={settings.connectorHeight}
				thickness={settings.thickness}
				gloss={settings.gloss}
				size={settings.size}
				bottom={bottom}
				x={outline.connector?.x ?? 0}
				width={
					outline.connector?.width ??
					(settings.connectorWidth / settings.size) * 2
				}
			/>
		</AcrylicSheet>
	);
}
