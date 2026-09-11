import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { HIDDEN_SCENES, SCENES, type SceneKind } from "@/lib/studio/scenes";

export function SceneControls({
	value,
	onChange,
}: {
	value: SceneKind;
	onChange: (value: SceneKind) => void;
}) {
	return (
		<section className="mb-8 [&_h2]:mb-3 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-[#dedede] max-[700px]:mb-4 max-[700px]:[&_h2]:mb-2">
			<h2>场景</h2>
			<Select
				value={value}
				onValueChange={(value) => onChange(value as SceneKind)}
			>
				<SelectTrigger
					className="min-h-11 !w-full !rounded-[14px] !px-4"
					aria-label="场景"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent className="!rounded-[20px] !bg-[#292929] !p-2.5 shadow-[0_10px_30px_#0003] max-[700px]:select-none">
					{(Object.keys(SCENES) as SceneKind[])
						.filter((key) => !HIDDEN_SCENES.has(key))
						.map((key) => (
							<SelectItem key={key} value={key}>
								{SCENES[key].label}
							</SelectItem>
						))}
				</SelectContent>
			</Select>
		</section>
	);
}
