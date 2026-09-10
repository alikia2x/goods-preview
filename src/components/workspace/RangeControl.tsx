import { Slider } from "@/components/ui/slider";

type RangeControlProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	display?: string;
};

export function RangeControl({
	label,
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	display,
}: RangeControlProps) {
	return (
		<div className="slider-control">
			<div className="control-label">
				<span>{label}</span>
				<span>{display ?? `${value}%`}</span>
			</div>
			<Slider
				aria-label={label}
				value={[value]}
				min={min}
				max={max}
				step={step}
				onValueChange={(values) => {
					const nextValue = values[0];
					if (nextValue !== undefined) onChange(nextValue);
				}}
			/>
		</div>
	);
}
