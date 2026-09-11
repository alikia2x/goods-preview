import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { BADGE_SIZES, VIEW_OPTIONS } from "@/lib/badge/constants";
import type { BadgeView } from "@/lib/badge/types";
import controlStyles from "@/styles/studio-controls.module.css";
import layoutStyles from "@/styles/workspace.module.css";

type PreviewToolbarProps = {
	children: ReactNode;
	onViewChange: (view: BadgeView) => void;
};

export function PreviewToolbar({
	children,
	onViewChange,
}: PreviewToolbarProps) {
	return (
		<footer
			className={`${layoutStyles.previewFooter} flex items-center justify-between gap-4`}
		>
			{children}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						className="inline-flex h-[46px] items-center justify-center gap-[9px] !rounded-full !bg-[#292929] px-[22px] text-sm font-[550] whitespace-nowrap !text-[#fafafa] shadow-[0_5px_15px_#00000015] hover:!bg-[#3b3b3b] max-[700px]:h-11 max-[700px]:gap-1 max-[700px]:px-3 max-[700px]:text-[11px]"
					>
						<ChevronUp /> 调整视角
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					className={`${controlStyles.popoverContent} max-[700px]:select-none`}
				>
					<p className="mb-4 text-sm">视角</p>
					<div className="flex flex-wrap gap-2.5 [&_[data-slot=button]]:flex-1 [&_[data-slot=button]]:px-2.5">
						{VIEW_OPTIONS.map((option) => (
							<Button
								key={option.value}
								variant="outline"
								onClick={() => onViewChange(option.value)}
							>
								{option.label}
							</Button>
						))}
					</div>
					<Button
						variant="ghost"
						className="mt-3 w-full"
						onClick={() => onViewChange("angle")}
					>
						<RotateCcw /> 重置视角
					</Button>
				</PopoverContent>
			</Popover>
		</footer>
	);
}

export function SizeControl({
	size,
	onSizeChange,
	arrow = "up",
}: {
	size: number;
	onSizeChange: (size: number) => void;
	arrow?: "up" | "down";
}) {
	const Arrow = arrow === "down" ? ChevronDown : ChevronUp;
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					className="inline-flex h-[46px] items-center justify-center gap-[9px] !rounded-full !bg-[#292929] px-[22px] text-sm font-[550] whitespace-nowrap !text-[#fafafa] shadow-[0_5px_15px_#00000015] hover:!bg-[#3b3b3b] tabular-nums max-[700px]:h-11 max-[700px]:gap-1 max-[700px]:px-3 max-[700px]:text-[11px]"
				>
					<Arrow /> {size} × {size} mm
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className={`${controlStyles.popoverContent} max-[700px]:select-none`}
			>
				<p className="mb-4 text-sm">徽章直径</p>
				<div className="flex flex-wrap gap-2.5 [&_[data-slot=button]]:flex-1 [&_[data-slot=button]]:px-2.5">
					{BADGE_SIZES.map((option) => (
						<Button
							key={option}
							variant={size === option ? "default" : "outline"}
							onClick={() => onSizeChange(option)}
						>
							{option}
						</Button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
