import { AcrylicSheet } from "@/features/acrylic/AcrylicSheet";
import type { Outline } from "@/features/acrylic/lib/geometry";
import type { StandeeSettings } from "@/features/acrylic/settings";
import { StandeeBase } from "@/features/acrylic/StandeeBase";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";

// 亚克力立牌：the sheet seated in its base.
export function StandeeModel({
	artwork,
	outline,
	settings,
}: {
	artwork: KeychainArtwork;
	outline: Outline;
	settings: StandeeSettings;
}) {
	const bottom = Math.min(...outline.points.map((point) => point.y));
	return (
		<AcrylicSheet
			artwork={artwork}
			outline={outline}
			size={settings.size}
			thickness={settings.thickness}
			gloss={settings.gloss}
			scene={settings.scene}
		>
			<StandeeBase
				baseDiameter={settings.baseDiameter}
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
