import { ChevronUp, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { trackViewModeChange } from "@/features/analytics/events";
import { VIEW_OPTIONS } from "@/features/badge/constants";
import type { BadgeView } from "@/features/badge/settings";
import { OptionButtonGroup } from "@/components/workspace/OptionButtonGroup";
import { PillButton } from "@/components/workspace/PillButton";
import { PositionOffsetControls } from "@/components/workspace/PositionOffsetControls";

type PreviewToolbarProps = {
	children: ReactNode;
	onViewChange: (view: BadgeView) => void;
	showPositionControls?: boolean;
};

const VIEW_VALUES = VIEW_OPTIONS.map((option) => option.value);
const VIEW_LABELS = new Map(
	VIEW_OPTIONS.map((option) => [option.value, option.label]),
);

export function PreviewToolbar({
	children,
	onViewChange,
	showPositionControls = false,
}: PreviewToolbarProps) {
	return (
		<>
			{children}
			<Popover>
				<PopoverTrigger asChild>
					<PillButton>
						<ChevronUp /> 调整视角
					</PillButton>
				</PopoverTrigger>
				<PopoverContent align="end">
					<p className="mb-4 text-sm">视角</p>
					<OptionButtonGroup
						options={VIEW_VALUES}
						onChange={(view) => {
							trackViewModeChange(view);
							onViewChange(view);
						}}
						renderLabel={(value) => VIEW_LABELS.get(value)}
					/>
					<Button
						variant="ghost"
						className="mt-3 w-full"
						onClick={() => onViewChange("angle")}
					>
						<RotateCcw /> 重置视角
					</Button>
					{showPositionControls && <PositionOffsetControls />}
				</PopoverContent>
			</Popover>
		</>
	);
}
