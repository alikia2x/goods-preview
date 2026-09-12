import { AcrylicSheet } from "@/features/acrylic/AcrylicSheet";
import { AcrylicStudio } from "@/features/acrylic/AcrylicStudio";
import { acrylicFrame } from "@/features/acrylic/lib/frame";
import type { Outline } from "@/features/acrylic/lib/geometry";
import type { AcrylicSettings } from "@/features/acrylic/settings";
import { ACRYLIC_CAMERA, PRODUCT_DEFAULTS } from "@/tuning";

const mount = () => null;
const frame = (outline: Outline, settings: AcrylicSettings) =>
	acrylicFrame(outline, settings.size);

export default function AcrylicWorkspace() {
	return (
		<AcrylicStudio
			product="acrylic"
			defaults={PRODUCT_DEFAULTS.acrylic}
			mount={mount}
			frame={frame}
			opening={ACRYLIC_CAMERA.opening.acrylic}
			productName={() => "任意亚克力"}
			renderModel={(model, settings) => (
				<AcrylicSheet
					artwork={model.artwork}
					outline={model.outline}
					size={settings.size}
					thickness={settings.thickness}
					gloss={settings.gloss}
					scene={settings.scene}
				/>
			)}
		/>
	);
}
