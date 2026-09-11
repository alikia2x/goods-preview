import { BADGE_SIZES } from "@/features/badge/constants";
import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import { SizePopover } from "@/components/workspace/SizePopover";

export function BadgeSizePopover({
	size,
	onSizeChange,
	arrow,
	align,
}: {
	size: number;
	onSizeChange: (size: number) => void;
	arrow?: "up" | "down";
	align?: "start" | "end" | "center";
}) {
	return (
		<SizePopover display={`${size} × ${size} mm`} arrow={arrow} align={align}>
			<p className="mb-4 text-sm">徽章直径</p>
			<OptionButtonGroup
				options={BADGE_SIZES}
				value={size}
				onChange={onSizeChange}
			/>
		</SizePopover>
	);
}
