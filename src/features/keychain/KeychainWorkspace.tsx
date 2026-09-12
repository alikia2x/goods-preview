import { AcrylicStudio } from "@/features/acrylic/AcrylicStudio";
import type { Outline } from "@/features/acrylic/lib/geometry";
import { ACRYLIC_CAMERA, PRODUCT_DEFAULTS } from "@/tuning";
import { keychainFrame } from "@/features/acrylic/lib/frame";
import type { KeychainSettings } from "@/features/keychain/settings";
import { KeychainModel } from "@/features/keychain/model/KeychainModel";
// import { KEYCHAIN_HARDWARE_COLORS } from "@/features/keychain/lib/materials";
// import { KeychainProductControls } from "@/features/keychain/controls/KeychainProductControls";

const mount = () => "keychain" as const;
const frame = (outline: Outline, settings: KeychainSettings) =>
	keychainFrame(outline, settings.size, settings.hardware);

export default function KeychainWorkspace() {
	return (
		<AcrylicStudio
			product="keychain"
			defaults={PRODUCT_DEFAULTS.keychain}
			mount={mount}
			frame={frame}
			opening={ACRYLIC_CAMERA.opening.keychain}
			productName={(_settings) =>
				// `亚克力钥匙扣 · ${KEYCHAIN_HARDWARE_COLORS[settings.hardwareColor].label}`
				`亚克力钥匙扣`
			}
			// variantControls={<KeychainProductControls />}
			renderModel={(model, settings) => (
				<KeychainModel {...model} settings={settings} />
			)}
		/>
	);
}
