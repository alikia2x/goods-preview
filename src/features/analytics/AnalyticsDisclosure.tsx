// import { useState } from "react";
// import { Switch } from "@/components/ui/switch";
// import {
// 	analyticsAllowed,
// 	setAnalyticsOptOut,
// } from "@/features/analytics/consent";
// import { trackAnalyticsOptOut } from "@/features/analytics/events";

// Shown inside the About dialog. One line says the tool measures usage, one
// line says it can be turned off, one sentence says what is never uploaded —
// the minimum a person needs to make an informed choice, with no banner.
export function AnalyticsDisclosure() {
	// const [enabled, setEnabled] = useState(analyticsAllowed());
	// return (
	// 	<div className="grid gap-2">
	// 		<div className="flex items-center justify-between gap-4 text-xs text-panel-dim tabular-nums">
	// 			<label htmlFor="analytics-enabled">匿名使用统计</label>
	// 			<Switch
	// 				id="analytics-enabled"
	// 				checked={enabled}
	// 				onCheckedChange={(value) => {
	// 					trackAnalyticsOptOut(value);
	// 					setAnalyticsOptOut(!value);
	// 					setEnabled(value);
	// 				}}
	// 			/>
	// 		</div>
	// 	</div>
	// );
	return <></>;
}
