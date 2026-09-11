import type * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// Determinate when `value` is a number; Radix reports the indeterminate state
// when it is null, and the width plus the sweep animation below drive the bar.
function Progress({
	className,
	value,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			value={value}
			className={cn(
				"relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
				className,
			)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot="progress-indicator"
				className="h-full w-full rounded-full bg-primary transition-all data-[state=indeterminate]:animate-progress-sweep motion-reduce:animate-none"
				style={
					value == null
						? { width: "40%" }
						: { transform: `translateX(-${100 - value}%)` }
				}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };
