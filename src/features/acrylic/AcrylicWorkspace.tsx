import { AcrylicPoseControls } from "@/features/acrylic/AcrylicPoseControls";
import { AcrylicSheet } from "@/features/acrylic/AcrylicSheet";
import { AcrylicStudio } from "@/features/acrylic/AcrylicStudio";
import { acrylicFrame } from "@/features/acrylic/lib/frame";
import type { Outline } from "@/features/acrylic/lib/geometry";
import {
	type AcrylicSettings,
	deriveAcrylicSettings,
} from "@/features/acrylic/settings";
import { ACRYLIC_CAMERA, PRODUCT_DEFAULTS } from "@/tuning";

const mount = () => null;
const frame = (outline: Outline, settings: AcrylicSettings) =>
	acrylicFrame(outline, settings.size, settings.thickness, settings.pose);

export default function AcrylicWorkspace() {
	return (
		<AcrylicStudio
			product="acrylic"
			defaults={PRODUCT_DEFAULTS.acrylic}
			derive={deriveAcrylicSettings}
			mount={mount}
			frame={frame}
			opening={ACRYLIC_CAMERA.opening.acrylic}
			poseOf={(settings) => settings.pose}
			poseControls={<AcrylicPoseControls />}
			productName={() => "任意亚克力"}
			renderModel={(model, settings) => (
				<AcrylicSheet
					artwork={model.artwork}
					window={model.window}
					outline={model.outline}
					size={settings.size}
					thickness={settings.thickness}
					gloss={settings.gloss}
					windowStrength={settings.windowStrength}
					scene={settings.scene}
					positionOffsetZ={settings.positionOffsetZ}
					pose={settings.pose}
				/>
			)}
		/>
	);
}
