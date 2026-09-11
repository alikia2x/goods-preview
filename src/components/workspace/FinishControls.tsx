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
		<section className="mb-8 [&_h2]:mb-3 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-[#dedede] max-[700px]:mb-4 max-[700px]:[&_h2]:mb-2">
			<h2>覆膜</h2>
			<div className="flex flex-wrap gap-2.5 [&_[data-slot=button]]:flex-1 [&_[data-slot=button]]:px-2.5">
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
