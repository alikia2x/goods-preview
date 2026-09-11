import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

const section = tv({
	slots: {
		base: "mb-8 max-mobile:mb-4",
		title: "mb-3 text-sm font-medium text-panel-muted max-mobile:mb-2",
	},
});

export function AdjustmentSection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	const styles = section();
	return (
		<section className={styles.base()}>
			<h2 className={styles.title()}>{title}</h2>
			{children}
		</section>
	);
}
