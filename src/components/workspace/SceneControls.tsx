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
		<section className="control-section">
			<h2>场景</h2>
			<Select
				value={value}
				onValueChange={(value) => onChange(value as SceneKind)}
			>
				<SelectTrigger className="scene-select" aria-label="场景">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
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
