import { ChevronUp, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { BADGE_SIZES, VIEW_OPTIONS } from "@/lib/badge/constants";
import type { BadgeView } from "@/lib/badge/types";

type PreviewToolbarProps = {
	children: ReactNode;
	onViewChange: (view: BadgeView) => void;
};

export function PreviewToolbar({
	children,
	onViewChange,
}: PreviewToolbarProps) {
	return (
		<footer className="preview-footer">
			{children}
			<Popover>
				<PopoverTrigger asChild>
					<Button className="pill">
						<ChevronUp /> 调整视角
					</Button>
				</PopoverTrigger>
				<PopoverContent align="end">
					<p className="popover-label">视角</p>
					<div className="option-row">
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
}: {
	size: number;
	onSizeChange: (size: number) => void;
}) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="pill">
					<ChevronUp /> {size} × {size} mm
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start">
				<p className="popover-label">徽章直径</p>
				<div className="option-row">
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
