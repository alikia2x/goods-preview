import { SupportDialog } from "@/components/workspace/SupportDialog";
import { PRODUCT_TUTORIALS } from "@/features/tutorial";
import type { ProductKind } from "@/tuning";

// The tutorial of the product that is open, reached from the same menu that
// switches products.
export function ProductTutorialDialog({
	product,
	open,
	onOpenChange,
}: {
	product: ProductKind;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const tutorial = PRODUCT_TUTORIALS[product];
	return (
		<SupportDialog
			open={open}
			onOpenChange={onOpenChange}
			title={tutorial.title}
			description={tutorial.description}
			actionLabel="开始制作"
		>
			<div className="grid gap-6">{tutorial.content}</div>
		</SupportDialog>
	);
}
