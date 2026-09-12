import { AcrylicSheet } from "@/features/acrylic/AcrylicSheet";
import { type Outline, sheetThickness } from "@/features/acrylic/lib/geometry";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";
import { KeychainHardware } from "@/features/keychain/model/KeychainHardware";
import type { KeychainSettings } from "@/features/keychain/settings";

// 亚克力钥匙扣：the sheet plus the hardware that hangs it.
export function KeychainModel({
	artwork,
	outline,
	settings,
}: {
	artwork: KeychainArtwork;
	outline: Outline;
	settings: KeychainSettings;
}) {
	return (
		<AcrylicSheet
			artwork={artwork}
			outline={outline}
			size={settings.size}
			thickness={settings.thickness}
			gloss={settings.gloss}
			scene={settings.scene}
		>
			<KeychainHardware
				hole={outline.hole}
				kind={settings.hardware}
				thickness={sheetThickness(settings.thickness, settings.size)}
				color={settings.hardwareColor}
			/>
		</AcrylicSheet>
	);
}
