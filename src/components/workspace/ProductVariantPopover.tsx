import type { ReactNode } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PillButton } from "@/components/workspace/PillButton";

export function ProductVariantPopover({
	label,
	ariaLabel,
	children,
}: {
	label: string;
	ariaLabel: string;
	children: ReactNode;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<PillButton aria-label={ariaLabel}>{label}</PillButton>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="max-h-[var(--radix-popover-content-available-height)] overflow-y-auto"
			>
				{children}
			</PopoverContent>
		</Popover>
	);
}
