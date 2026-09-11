import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function OptionButtonGroup<T extends string | number>({
	options,
	value,
	onChange,
	renderLabel,
}: {
	options: readonly T[];
	value?: T;
	onChange: (value: T) => void;
	renderLabel?: (value: T) => ReactNode;
}) {
	return (
		<div className="flex flex-wrap gap-2.5 [&_[data-slot=button]]:flex-1 [&_[data-slot=button]]:px-2.5">
			{options.map((option) => (
				<Button
					key={option}
					variant={value === option ? "default" : "outline"}
					aria-pressed={value === option}
					onClick={() => onChange(option)}
				>
					{renderLabel ? renderLabel(option) : option}
				</Button>
			))}
		</div>
	);
}
