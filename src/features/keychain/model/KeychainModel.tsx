import { AcrylicSheet } from "@/features/acrylic/AcrylicSheet";
import type { Outline } from "@/features/acrylic/lib/geometry";
import type { KeychainArtwork } from "@/features/keychain/lib/artwork";
import { KeychainHardware } from "@/features/keychain/model/KeychainHardware";
import type { KeychainSettings } from "@/features/keychain/settings";

// 亚克力钥匙扣：the sheet plus the hardware that hangs it.
export function KeychainModel({
	artwork,
	window,
	outline,
	settings,
}: {
	artwork: KeychainArtwork;
	window?: HTMLImageElement | HTMLCanvasElement | null;
	outline: Outline;
	settings: KeychainSettings;
}) {
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
		>
			<KeychainHardware
				hole={outline.hole}
				kind={settings.hardware}
				size={settings.size}
				thickness={settings.thickness}
				color={settings.hardwareColor}
			/>
		</AcrylicSheet>
	);
}
