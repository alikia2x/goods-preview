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
import {
	OPTION_ROW_CLASS_NAME,
	PILL_CLASS_NAME,
	POPOVER_LABEL_CLASS_NAME,
} from "./classNames";

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
					<Button variant="ghost" className={PILL_CLASS_NAME}>
						<ChevronUp /> 调整视角
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					className={`${controlStyles.popoverContent} max-[700px]:select-none`}
				>
					<p className={POPOVER_LABEL_CLASS_NAME}>视角</p>
					<div className={OPTION_ROW_CLASS_NAME}>
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
				<Button variant="ghost" className={`${PILL_CLASS_NAME} tabular-nums`}>
					<Arrow /> {size} × {size} mm
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className={`${controlStyles.popoverContent} max-[700px]:select-none`}
			>
				<p className={POPOVER_LABEL_CLASS_NAME}>徽章直径</p>
				<div className={OPTION_ROW_CLASS_NAME}>
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
