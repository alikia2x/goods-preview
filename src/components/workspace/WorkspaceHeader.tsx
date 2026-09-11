import type { ReactNode } from "react";
import { useMobile } from "@/hooks/useMobile";
import { PRODUCT_VERSION } from "@/features/badge/constants";
import { PillButton } from "@/components/workspace/PillButton";
import { ProductMenu } from "@/components/workspace/ProductMenu";
import { ProductVariantPopover } from "@/components/workspace/ProductVariantPopover";
import { useWorkspaceSupport } from "@/components/workspace/WorkspaceSupport";

// Shared top bar for every product workspace: menu + product-variant popover on
// the left, size control (compact) or the about button on the right.
export function WorkspaceHeader({
	product,
	productName,
	variantAriaLabel,
	variant,
	sizeControl,
}: {
	product: "badge" | "keychain";
	productName: string;
	variantAriaLabel: string;
	variant: ReactNode;
	sizeControl: ReactNode;
}) {
	const mobile = useMobile() === "mobile";
	const { openAbout } = useWorkspaceSupport();
	return (
		<>
			<div className="flex min-w-0 items-center gap-3 max-mobile:gap-1.5">
				<ProductMenu product={product} />
				<ProductVariantPopover label={productName} ariaLabel={variantAriaLabel}>
					{variant}
				</ProductVariantPopover>
			</div>
			{mobile ? (
				sizeControl
			) : (
				<PillButton
					className="gap-1.25 [&_span]:text-xs [&_span]:text-panel-faint max-compact:hidden"
					onClick={openAbout}
					aria-label="打开 Goods Preview 关于信息"
				>
					Goods Preview <span>{PRODUCT_VERSION}</span>
				</PillButton>
			)}
		</>
	);
}
