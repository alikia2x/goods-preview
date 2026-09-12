import { RangeControl } from "@/components/workspace/RangeControl";
import { SizePopover } from "@/components/workspace/SizePopover";

export function PatternSizePopover({
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
		<SizePopover display={`${size / 10} cm`} arrow={arrow} align={align}>
			<RangeControl
				label="图案长边"
				value={size}
				min={30}
				max={250}
				commitOnly
				display={(value) => `${value / 10} cm`}
				onChange={onSizeChange}
			/>
		</SizePopover>
	);
}
