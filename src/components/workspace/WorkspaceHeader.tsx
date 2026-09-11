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
import { FinishControls } from "./FinishControls";
import { SizeControl } from "./PreviewToolbar";
import { ProductMenu } from "./ProductMenu";
import { useWorkspaceSupport } from "./WorkspaceSupport";

export function WorkspaceHeader({
	settings,
	onSettingChange,
}: {
	settings: Settings;
	onSettingChange: SettingChange;
}) {
	const finish = settings.finish;
	const mobile = useMobile();
	const { openAbout } = useWorkspaceSupport();
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
							className="inline-flex h-[46px] items-center justify-center gap-[9px] !rounded-full !bg-[#292929] px-[22px] text-sm font-[550] whitespace-nowrap !text-[#fafafa] shadow-[0_5px_15px_#00000015] hover:!bg-[#3b3b3b] max-[700px]:h-11 max-[700px]:gap-1 max-[700px]:px-3 max-[700px]:text-[11px]"
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
				<Button
					variant="ghost"
					className="inline-flex h-[46px] items-center justify-center gap-1.25 !rounded-full !bg-[#292929] px-[22px] text-sm font-[550] whitespace-nowrap !text-[#fafafa] shadow-[0_5px_15px_#00000015] hover:!bg-[#3b3b3b] [&_span]:text-xs [&_span]:text-[#c2c2c2] max-[1100px]:hidden"
					onClick={openAbout}
					aria-label="打开 Goods Preview 关于信息"
				>
					Goods Preview <span>{PRODUCT_VERSION}</span>
				</Button>
			)}
		</header>
	);
}
