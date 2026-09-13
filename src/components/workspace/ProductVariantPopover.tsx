import type { ReactNode } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PillButton } from "@/components/workspace/PillButton";
import { cn } from "@/lib/utils";

export function ProductVariantPopover({
	label,
	ariaLabel,
	contentClassName,
	children,
}: {
	label: string;
	ariaLabel: string;
	contentClassName?: string;
	children: ReactNode;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<PillButton aria-label={ariaLabel}>{label}</PillButton>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className={cn(
					"max-h-(--radix-popover-content-available-height) overflow-y-auto",
					contentClassName,
				)}
			>
				{children}
			</PopoverContent>
		</Popover>
	);
}
