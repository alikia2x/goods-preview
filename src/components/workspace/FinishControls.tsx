import { Button } from "@/components/ui/button";
import { FINISHES } from "@/lib/badge/finishes";
import type { SettingChange, Settings } from "@/lib/badge/types";
import {
	CONTROL_SECTION_CLASS_NAME,
	OPTION_ROW_CLASS_NAME,
} from "./classNames";

export function FinishControls({
	settings,
	onChange,
}: {
	settings: Settings;
	onChange: SettingChange;
}) {
	return (
		<section className={CONTROL_SECTION_CLASS_NAME}>
			<h2>覆膜</h2>
			<div className={OPTION_ROW_CLASS_NAME}>
				{(["glossy", "matte"] as const).map((finish) => (
					<Button
						key={finish}
						variant={settings.finish === finish ? "default" : "outline"}
						aria-pressed={settings.finish === finish}
						onClick={() => onChange("finish", finish)}
					>
						{FINISHES[finish].label}
					</Button>
				))}
			</div>
		</section>
	);
}
