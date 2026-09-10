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
		<header className="preview-header">
			<div className="header-group">
				<ProductMenu product="badge" />
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
