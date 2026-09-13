import type { ReactNode } from "react";
import { tv } from "tailwind-variants";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

// The one dialog every piece of support copy is shown in: a title, a line of
// description under it, free-form content and a single closing action. The
// basic tutorial, the about panel and each product's tutorial are this surface
// with different words.
const supportDialog = tv({
	slots: {
		content:
			"gap-6 rounded-4xl bg-panel p-7 text-panel-foreground shadow-[0_24px_80px_#00000040] max-mobile:p-6 max-h-[calc(100dvh-2rem)] overflow-y-auto",
		title: "text-[28px] font-[650] text-white",
		description: "text-sm leading-6 text-panel-dim",
		action: "h-11 rounded-full bg-white text-panel hover:bg-inverse-hover",
	},
});

export function SupportDialog({
	open,
	onOpenChange,
	title,
	description,
	actionLabel,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: ReactNode;
	actionLabel: string;
	children: ReactNode;
}) {
	const styles = supportDialog();
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.content()} showCloseButton={false}>
				<DialogHeader className="gap-2">
					<DialogTitle className={styles.title()}>{title}</DialogTitle>
					{description !== undefined && (
						<DialogDescription className={styles.description()}>
							{description}
						</DialogDescription>
					)}
				</DialogHeader>
				{children}
				<DialogClose asChild>
					<Button className={styles.action()}>{actionLabel}</Button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}
