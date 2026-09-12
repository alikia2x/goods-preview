import { AcrylicStudio } from "@/features/acrylic/AcrylicStudio";
import { standeeFrame } from "@/features/acrylic/lib/frame";
import type { Outline, OutlineMount } from "@/features/acrylic/lib/geometry";
import type { StandeeSettings } from "@/features/acrylic/settings";
import { StandeeModel } from "@/features/acrylic/StandeeModel";
import { StandeeProductControls } from "@/features/acrylic/StandeeProductControls";
import { ACRYLIC_CAMERA, PRODUCT_DEFAULTS } from "@/tuning";

// The connector is cut into the outline at the size the user dialled in.
const mount = (settings: StandeeSettings): OutlineMount => ({
	width: settings.connectorWidth / settings.size,
	height: settings.connectorHeight / settings.size,
	x: settings.connectorX / 100,
	gap: settings.connectorY / settings.size,
});

const frame = (outline: Outline, settings: StandeeSettings) =>
	standeeFrame(outline, settings.size, settings.baseDiameter);

// The base has to stay wide enough to hold the connector it receives.
const derive = (next: StandeeSettings): StandeeSettings => ({
	...next,
	connectorWidth: Math.min(70, Math.max(5, next.connectorWidth)),
	baseDiameter: Math.max(next.baseDiameter, next.connectorWidth + 8),
});

export default function StandeeWorkspace() {
	return (
		<AcrylicStudio
			product="standee"
			defaults={PRODUCT_DEFAULTS.standee}
			derive={derive}
			mount={mount}
			frame={frame}
			opening={ACRYLIC_CAMERA.opening.standee}
			productName={() => "亚克力立牌"}
			variantControls={<StandeeProductControls />}
			renderModel={(model, settings) => (
				<StandeeModel {...model} settings={settings} />
			)}
		/>
	);
}
