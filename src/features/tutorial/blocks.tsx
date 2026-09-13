import type { ReactNode } from "react";

// The typography of every tutorial in one place: content files compose these
// instead of styling their own cards, so the basic tutorial and each product's
// tutorial stay the same surface. Steps number themselves with a CSS counter,
// so a content file only writes the steps it wants, in order.
export function TutorialSteps({ children }: { children: ReactNode }) {
	return (
		<ol className="m-0 grid list-none gap-3 p-0 [counter-reset:tutorial-step]">
			{children}
		</ol>
	);
}

export function TutorialStep({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<li
			className="grid grid-cols-[28px_1fr] gap-3 rounded-2xl bg-white/6 p-3.5
				before:col-start-1 before:row-start-1 before:self-center before:pt-0.5 before:text-2xl
				before:tabular-nums before:font-medium before:text-brand before:[counter-increment:tutorial-step]
				before:content-[counter(tutorial-step,decimal-leading-zero)]"
		>
			<span className="col-start-2 grid gap-0.5">
				<span className="text-sm font-medium text-white">{title}</span>
				<span className="text-xs leading-5 text-panel-dim">{children}</span>
			</span>
		</li>
	);
}

export function TutorialNote({ children }: { children: ReactNode }) {
	return (
		<p className="m-0 border-white/15 border-l-2 pl-3 text-xs leading-5 text-panel-dim">
			{children}
		</p>
	);
}
