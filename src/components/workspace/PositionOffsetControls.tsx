import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { RangeControl } from "@/components/workspace/RangeControl";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { ProductPositionSettings } from "@/features/studio/settings";

const POSITION_OFFSET_MIN = -50;
const POSITION_OFFSET_MAX = 300;

function formatDepthOffset(value: number) {
	if (value === 0) return "0 cm";
	const centimetres = Math.abs(value) / 10;
	const display = Number.isInteger(centimetres)
		? String(centimetres)
		: centimetres.toFixed(1);
	return `${value > 0 ? "前" : "后"} ${display} cm`;
}

// The upright set is the only scene where a product's placement relative to the
// wall and the floor is useful. Keep this out of the main adjustment panel so it
// stays next to the view presets that show the resulting placement.
export function PositionOffsetControls() {
	const { settings, updateSetting } = useWorkspace<ProductPositionSettings>();
	if (settings.scene !== "standing") return null;

	return (
		<div className="mt-2 border-t border-popover-foreground/10 pt-5">
			<AdjustmentSection title="位置偏移">
				<RangeControl
					label="前后位置"
					value={settings.positionOffsetZ}
					min={POSITION_OFFSET_MIN}
					max={POSITION_OFFSET_MAX}
					step={1}
					display={formatDepthOffset}
					onChange={(value) => updateSetting("positionOffsetZ", value)}
				/>
			</AdjustmentSection>
		</div>
	);
}
