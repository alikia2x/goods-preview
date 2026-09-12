import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import controlStyles from "@/styles/studio-controls.module.css";

type RangeControlProps = {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	display?: string | ((value: number) => string);
	commitOnly?: boolean;
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
	commitOnly = false,
	className,
}: RangeControlProps) {
	const [draftValue, setDraftValue] = useState(value);
	useEffect(() => setDraftValue(value), [value]);
	const sliderValue = commitOnly ? draftValue : value;
	const valueLabel =
		typeof display === "function"
			? display(sliderValue)
			: (display ?? `${sliderValue}%`);
	return (
		<div
			className={`${controlStyles.sliderControl} mb-5 min-w-0 max-mobile:mb-2 ${className ?? ""}`}
		>
			<div className="mb-1 flex justify-between gap-3 text-sm text-panel-label tabular-nums">
				<span>{label}</span>
				<span className="tabular-nums">{valueLabel}</span>
			</div>
			<Slider
				aria-label={label}
				value={[sliderValue]}
				min={min}
				max={max}
				step={step}
				onValueChange={(values) => {
					const nextValue = values[0];
					if (nextValue === undefined) return;
					if (commitOnly) setDraftValue(nextValue);
					else onChange(nextValue);
				}}
				onValueCommit={
					commitOnly
						? (values) => {
								const nextValue = values[0];
								if (nextValue !== undefined) onChange(nextValue);
							}
						: undefined
				}
			/>
		</div>
	);
}
