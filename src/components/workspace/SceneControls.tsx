import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	HIDDEN_SCENES,
	isSceneKind,
	SCENE_KINDS,
	SCENES,
	type SceneKind,
} from "@/features/studio/lib/scenes";

export function SceneControls({
	value,
	onChange,
}: {
	value: SceneKind;
	onChange: (value: SceneKind) => void;
}) {
	return (
		<AdjustmentSection title="场景">
			<Select
				value={value}
				onValueChange={(next) => {
					if (!isSceneKind(next)) return;
					onChange(next);
				}}
			>
				<SelectTrigger
					className="min-h-11 w-full! rounded-[14px]! px-4!"
					aria-label="场景"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent className="rounded-[20px]! bg-panel! p-2.5! shadow-[0_10px_30px_#0003] max-mobile:select-none">
					{SCENE_KINDS.filter((key) => !HIDDEN_SCENES.has(key)).map((key) => (
						<SelectItem key={key} value={key}>
							{SCENES[key].label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</AdjustmentSection>
	);
}
