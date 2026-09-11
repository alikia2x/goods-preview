import { RangeControl } from "@/components/workspace/RangeControl";
import { SizePopover } from "@/components/workspace/SizePopover";

export function KeychainSizePopover({
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
		<SizePopover display={`${size} mm`} arrow={arrow} align={align}>
			<RangeControl
				label="图案长边"
				value={size}
				min={40}
				max={80}
				display={`${size} mm`}
				onChange={onSizeChange}
			/>
		</SizePopover>
	);
}
