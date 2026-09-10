import { Button } from "@/components/ui/button";
import { FINISHES } from "@/lib/badge/finishes";
import type { SettingChange, Settings } from "@/lib/badge/types";

export function FinishControls({
	settings,
	onChange,
}: {
	settings: Settings;
	onChange: SettingChange;
}) {
	return (
		<section className="control-section">
			<h2>覆膜</h2>
			<div className="option-row">
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
