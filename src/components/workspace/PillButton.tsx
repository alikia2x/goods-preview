import type * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pill = tv({
	base: "inline-flex h-[46px] items-center justify-center gap-[9px] rounded-full px-[22px] text-sm font-[550] whitespace-nowrap shadow-[0_5px_15px_#00000015] max-mobile:h-11 max-mobile:gap-1 max-mobile:px-3 max-mobile:text-[11px]",
	variants: {
		tone: {
			solid: "bg-panel text-panel-foreground hover:bg-panel-hover",
			ghost: "bg-transparent text-foreground hover:bg-panel-hover",
			// A filled pill that is not an affordance: used where a product has
			// nothing to configure, so its name still sits in the same slot.
			static: "bg-panel text-panel-foreground",
		},
		icon: {
			true: "w-11.5 p-0 max-mobile:size-11 max-mobile:min-w-11",
			false: "",
		},
		numeric: {
			true: "tabular-nums",
			false: "",
		},
	},
	defaultVariants: { tone: "solid", icon: false, numeric: false },
});

export function PillButton({
	tone,
	icon,
	numeric,
	className,
	...props
}: React.ComponentProps<typeof Button> & VariantProps<typeof pill>) {
	return (
		<Button
			variant="ghost"
			className={cn(pill({ tone, icon, numeric }), className)}
			{...props}
		/>
	);
}

// The same pill, as a label rather than a control.
export function PillLabel({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(pill({ tone: "static" }), "shadow-none", className)}
			{...props}
		/>
	);
}
