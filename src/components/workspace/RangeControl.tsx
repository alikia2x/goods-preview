import { Slider } from "@/components/ui/slider";
import controlStyles from "@/styles/studio-controls.module.css";

type RangeControlProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	display?: string;
	className?: string;
};

export function RangeControl({
	label,
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	display,
	className,
}: RangeControlProps) {
	return (
		<div
			className={`${controlStyles.sliderControl} mb-5 min-w-0 max-[700px]:mb-2 ${className ?? ""}`}
		>
			<div className="mb-1 flex justify-between gap-3 text-sm text-[#d9d9d9] tabular-nums">
				<span>{label}</span>
				<span className="tabular-nums">{display ?? `${value}%`}</span>
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
