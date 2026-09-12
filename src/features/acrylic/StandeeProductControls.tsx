import type { PointerEvent } from "react";
import { Button } from "@/components/ui/button";

import { RangeControl } from "@/components/workspace/RangeControl";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { StandeeSettings } from "@/features/acrylic/settings";

// 立牌自己的底座与连接件。片的厚度与留边在共用的亚克力面板里。
export function StandeeProductControls() {
	const { settings, updateSetting } = useWorkspace<StandeeSettings>();
	const range = (
		key:
			| "baseDiameter"
			| "connectorWidth"
			| "connectorHeight"
			| "connectorX"
			| "connectorY",
		label: string,
		min: number,
		max: number,
		unit = "mm",
	) => (
		<RangeControl
			key={key}
			className="mb-0!"
			label={label}
			value={settings[key]}
			min={min}
			max={max}
			step={1}
			display={`${settings[key]} ${unit}`}
			onChange={(value) => updateSetting(key, value)}
		/>
	);
	const point = (event: PointerEvent<HTMLButtonElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		updateSetting(
			"connectorX",
			Math.round(
				Math.max(
					-100,
					Math.min(100, ((event.clientX - rect.left) / rect.width) * 200 - 100),
				),
			),
		);
		updateSetting(
			"connectorY",
			Math.round(
				Math.max(
					0,
					Math.min(20, ((event.clientY - rect.top) / rect.height) * 20),
				),
			),
		);
	};
	return (
		<div className="grid gap-6">
			<div className="grid gap-2">
				<h2 className="text-sm font-medium text-panel-muted">底座</h2>
				<div className="grid gap-3">
					{range("baseDiameter", "直径", 30, 100)}
					{range("connectorHeight", "高度", 2, 5)}
				</div>
			</div>
			<div className="grid gap-3">
				<h2 className="text-sm font-medium text-panel-muted">连接件</h2>
				{range("connectorWidth", "宽度", 5, 70)}
				<div className="grid gap-3">
					<div className="grid gap-3 order-2">
						{range("connectorX", "水平位置", -100, 100, "%")}
						{range("connectorY", "底部间距", 0, 20)}
					</div>
					<Button
						variant="ghost"
						className="relative h-28! w-full! rounded-xl! touch-none overflow-hidden border border-panel-subtle/30 !p-0"
						aria-label="拖动调整连接件位置；方向键调整"
						onPointerDown={(event) => {
							event.preventDefault();
							event.currentTarget.setPointerCapture(event.pointerId);
							point(event);
						}}
						onPointerMove={(event) => {
							if (event.currentTarget.hasPointerCapture(event.pointerId))
								point(event);
						}}
						onPointerUp={(event) => {
							if (event.currentTarget.hasPointerCapture(event.pointerId))
								event.currentTarget.releasePointerCapture(event.pointerId);
						}}
						onKeyDown={(event) => {
							if (
								!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
									event.key,
								)
							)
								return;
							event.preventDefault();
							if (event.key === "ArrowLeft" || event.key === "ArrowRight")
								updateSetting(
									"connectorX",
									Math.max(
										-100,
										Math.min(
											100,
											settings.connectorX +
												(event.key === "ArrowRight" ? 2 : -2),
										),
									),
								);
							else
								updateSetting(
									"connectorY",
									Math.max(
										0,
										Math.min(
											20,
											settings.connectorY +
												(event.key === "ArrowDown" ? 1 : -1),
										),
									),
								);
						}}
					>
						<span
							className="absolute h-2 w-7 rounded-sm bg-current"
							style={{
								left: `calc(${(settings.connectorX + 100) / 2}% - ${((settings.connectorX + 100) / 200) * 28}px)`,
								top: `calc(${settings.connectorY * 5}% - ${(settings.connectorY / 20) * 8}px)`,
							}}
						/>
					</Button>
				</div>
			</div>
		</div>
	);
}
