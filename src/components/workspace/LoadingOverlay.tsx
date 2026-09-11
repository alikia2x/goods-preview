import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// A load that finishes within the enter delay never shows the overlay, and a
// finished one stays mounted for its fade-out instead of disappearing abruptly.
const ENTER_DELAY_MS = 150;
const EXIT_DURATION_MS = 200;

function useFadePresence(active: boolean) {
	const [present, setPresent] = useState(false);
	const [shown, setShown] = useState(false);

	useEffect(() => {
		if (active) {
			// Mount right away at zero opacity, then fade in after the delay, so a
			// load that finishes during the delay never shows anything at all.
			setPresent(true);
			const timer = setTimeout(() => setShown(true), ENTER_DELAY_MS);
			return () => clearTimeout(timer);
		}
		setShown(false);
		const timer = setTimeout(() => setPresent(false), EXIT_DURATION_MS);
		return () => clearTimeout(timer);
	}, [active]);

	return { present, shown };
}

// The one loading surface: a compact panel with a status line and an
// indeterminate bar. The caller decides what it covers through `className`.
export function LoadingOverlay({
	label,
	active = true,
	className,
}: {
	label: string;
	active?: boolean;
	className?: string;
}) {
	const { present, shown } = useFadePresence(active);
	if (!present) return null;
	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(
				"grid place-items-center transition-opacity duration-200",
				shown ? "opacity-100" : "opacity-0",
				className,
			)}
		>
			<div className="grid w-[min(240px,70vw)] gap-3 rounded-2xl bg-panel/95 px-5 py-4 shadow-[0_12px_40px_#00000040]">
				<p className="text-center text-xs text-panel-faint">{label}</p>
				<Progress className="bg-white/15" aria-label={label} />
			</div>
		</div>
	);
}
