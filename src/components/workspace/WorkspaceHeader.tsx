import { Check, Menu } from "lucide-react";
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
import { FinishControls } from "./FinishControls";
import { SizeControl } from "./PreviewToolbar";

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
		<header className="preview-header">
			<div className="header-group">
				<Popover>
					<PopoverTrigger asChild>
						<Button className="pill menu-button" aria-label="工作区菜单">
							<Menu />
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start" className="menu-content">
						<span className="small-label">制品</span>
						<Button variant="ghost" className="w-full justify-between">
							{productName} <Check />
						</Button>
					</PopoverContent>
				</Popover>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							className="pill product-name"
							aria-label={`${productName}，切换覆膜`}
						>
							{productName}
						</Button>
					</PopoverTrigger>
					<PopoverContent align="start">
						<FinishControls settings={settings} onChange={onSettingChange} />
					</PopoverContent>
				</Popover>
			</div>
			{mobile ? (
				<SizeControl
					size={settings.size}
					onSizeChange={(value) => onSettingChange("size", value)}
				/>
			) : (
				<span className="pill brand">
					Goods Preview <span>{PRODUCT_VERSION}</span>
				</span>
			)}
		</header>
	);
}
