import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { HIDDEN_SCENES, SCENES, type SceneKind } from "@/lib/studio/scenes";
import {
	CONTROL_SECTION_CLASS_NAME,
	SCENE_SELECT_CLASS_NAME,
	SELECT_CONTENT_CLASS_NAME,
} from "./classNames";

export function SceneControls({
	value,
	onChange,
}: {
	value: SceneKind;
	onChange: (value: SceneKind) => void;
}) {
	return (
		<section className={CONTROL_SECTION_CLASS_NAME}>
			<h2>场景</h2>
			<Select
				value={value}
				onValueChange={(value) => onChange(value as SceneKind)}
			>
				<SelectTrigger className={SCENE_SELECT_CLASS_NAME} aria-label="场景">
					<SelectValue />
				</SelectTrigger>
				<SelectContent className={SELECT_CONTENT_CLASS_NAME}>
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
