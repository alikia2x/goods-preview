import type { PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import type { StudioSettings } from "@/features/studio/settings";
import {
	lightAnglesFromPoint,
	lightDirection,
} from "@/features/studio/lib/lighting";
import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { RangeControl } from "@/components/workspace/RangeControl";

export function LightDirectionControls({
	settings,
	onChange,
}: {
	settings: Pick<StudioSettings, "lightAzimuth" | "lightElevation">;
	onChange: (key: "lightAzimuth" | "lightElevation", value: number) => void;
}) {
	const direction = lightDirection(
		settings.lightAzimuth,
		settings.lightElevation,
	);
	const point = (event: PointerEvent<HTMLButtonElement>) => {
		const bounds = event.currentTarget.getBoundingClientRect();
		const angles = lightAnglesFromPoint(
			(event.clientX - bounds.left - bounds.width / 2) / (bounds.width * 0.37),
			(event.clientY - bounds.top - bounds.height / 2) / (bounds.height * 0.37),
			settings.lightAzimuth,
		);
		onChange("lightAzimuth", angles.azimuth);
		onChange("lightElevation", angles.elevation);
	};
	return (
		<AdjustmentSection title="光照方向">
			<div className="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-3.5">
				<div className="min-w-0">
					<RangeControl
						label="方向角"
						value={settings.lightAzimuth}
						min={-180}
						max={180}
						display={`${Math.round(settings.lightAzimuth)}°`}
						className="mb-1.5"
						onChange={(value) => onChange("lightAzimuth", value)}
					/>
					<RangeControl
						label="高度角"
						value={settings.lightElevation}
						min={0}
						max={90}
						display={`${Math.round(settings.lightElevation)}°`}
						className="mb-1.5"
						onChange={(value) => onChange("lightElevation", value)}
					/>
				</div>
				<Button
					variant="ghost"
					className="aspect-square h-auto! w-full! cursor-crosshair rounded-full! p-0 touch-none"
					aria-label={`拖动调整光照。盘中心是正上方，边缘是贴地，上方是制品前方，下方是背面。当前方向 ${Math.round(settings.lightAzimuth)} 度，高度 ${Math.round(settings.lightElevation)} 度；方向键调整`}
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
						const step = event.shiftKey ? 10 : 2;
						if (event.key === "ArrowLeft" || event.key === "ArrowRight")
							onChange(
								"lightAzimuth",
								((settings.lightAzimuth +
									(event.key === "ArrowRight" ? step : -step) +
									540) %
									360) -
									180,
							);
						else
							onChange(
								"lightElevation",
								Math.min(
									90,
									Math.max(
										0,
										settings.lightElevation +
											(event.key === "ArrowUp" ? step : -step),
									),
								),
							);
					}}
				>
					<svg
						className="size-full"
						viewBox="0 0 100 100"
						aria-hidden="true"
						aria-label={`光照方向 ${Math.round(settings.lightAzimuth)} 度，高度 ${Math.round(settings.lightElevation)} 度`}
					>
						<circle
							className="fill-wheel-fill stroke-wheel-stroke"
							cx="50"
							cy="50"
							r="46"
							strokeWidth="1"
						/>
						{/* Seen from above: the product's front is at the top of the disc
						    and its right is to the right. */}
						<circle
							cx={50 + direction.x * 37}
							cy={50 - direction.z * 37}
							r="7"
							fill="white"
						/>
					</svg>
				</Button>
			</div>
		</AdjustmentSection>
	);
}
