import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useMobile } from "@/hooks/useMobile";
import { PRODUCT_VERSION } from "@/lib/badge/constants";
import { FINISHES } from "@/lib/badge/finishes";
import type { SettingChange, Settings } from "@/lib/badge/types";
import controlStyles from "@/styles/studio-controls.module.css";
import layoutStyles from "@/styles/workspace.module.css";
import { PILL_CLASS_NAME } from "./classNames";
import { FinishControls } from "./FinishControls";
import { SizeControl } from "./PreviewToolbar";
import { ProductMenu } from "./ProductMenu";

export function WorkspaceHeader({
	settings,
	onSettingChange,
}: {
	settings: Settings;
	onSettingChange: SettingChange;
}) {
	const finish = settings.finish;
	const mobile = useMobile();
	const productName = `覆膜吧唧 · ${FINISHES[finish].label}`;
	return (
		<header
			className={`${layoutStyles.previewHeader} flex items-center justify-between gap-4 max-[700px]:gap-2`}
		>
			<div className="flex min-w-0 items-center gap-3 max-[700px]:gap-1.5">
				<ProductMenu product="badge" />
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							className={PILL_CLASS_NAME}
							aria-label={`${productName}，切换覆膜`}
						>
							{productName}
						</Button>
					</PopoverTrigger>
					<PopoverContent
						align="start"
						className={`${controlStyles.popoverContent} max-[700px]:select-none`}
					>
						<FinishControls settings={settings} onChange={onSettingChange} />
					</PopoverContent>
				</Popover>
			</div>
			{mobile ? (
				<SizeControl
					size={settings.size}
					arrow="down"
					onSizeChange={(value) => onSettingChange("size", value)}
				/>
			) : (
				<span
					className={`${PILL_CLASS_NAME} gap-[5px] [&_span]:text-xs [&_span]:text-[#c2c2c2] max-[1100px]:hidden`}
				>
					Goods Preview <span>{PRODUCT_VERSION}</span>
				</span>
			)}
		</header>
	);
}
