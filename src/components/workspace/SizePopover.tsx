import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PillButton } from "@/components/workspace/PillButton";

export function SizePopover({
	display,
	arrow = "up",
	align = "start",
	children,
}: {
	display: ReactNode;
	arrow?: "up" | "down";
	align?: "start" | "end" | "center";
	children: ReactNode;
}) {
	const Arrow = arrow === "down" ? ChevronDown : ChevronUp;
	return (
		<Popover>
			<PopoverTrigger asChild>
				<PillButton numeric>
					<Arrow />
					{display}
				</PillButton>
			</PopoverTrigger>
			<PopoverContent align={align}>{children}</PopoverContent>
		</Popover>
	);
}
