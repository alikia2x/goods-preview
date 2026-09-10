import { Slider } from "@/components/ui/slider";
import controlStyles from "@/styles/studio-controls.module.css";
import {
	CONTROL_LABEL_CLASS_NAME,
	SLIDER_CONTROL_CLASS_NAME,
} from "./classNames";

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
			className={`${controlStyles.sliderControl} ${SLIDER_CONTROL_CLASS_NAME} ${className ?? ""}`}
		>
			<div className={CONTROL_LABEL_CLASS_NAME}>
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
