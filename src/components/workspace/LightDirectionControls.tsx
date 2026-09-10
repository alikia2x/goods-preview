import type { PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { lightAnglesFromPoint, lightDirection } from "@/lib/badge/lighting";
import type { SettingChange, Settings } from "@/lib/badge/types";
import { RangeControl } from "./RangeControl";

export function LightDirectionControls({
	settings,
	onChange,
}: {
	settings: Settings;
	onChange: SettingChange;
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
		<section className="control-section light-direction">
			<h2>光照方向</h2>
			<div className="light-direction-layout">
				<div className="light-direction-sliders">
					<RangeControl
						label="方向角"
						value={settings.lightAzimuth}
						min={-180}
						max={180}
						display={`${Math.round(settings.lightAzimuth)}°`}
						onChange={(value) => onChange("lightAzimuth", value)}
					/>
					<RangeControl
						label="高度角"
						value={settings.lightElevation}
						min={15}
						max={90}
						display={`${Math.round(settings.lightElevation)}°`}
						onChange={(value) => onChange("lightElevation", value)}
					/>
				</div>
				<Button
					variant="ghost"
					className="light-direction-pad"
					aria-label={`拖动调整光照，方向 ${Math.round(settings.lightAzimuth)} 度，高度 ${Math.round(settings.lightElevation)} 度；方向键调整`}
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
										15,
										settings.lightElevation +
											(event.key === "ArrowUp" ? step : -step),
									),
								),
							);
					}}
				>
					<svg
						className="light-direction-diagram"
						viewBox="0 0 100 100"
						aria-hidden="true"
						aria-label={`光照方向 ${Math.round(settings.lightAzimuth)} 度，高度 ${Math.round(settings.lightElevation)} 度`}
					>
						<circle
							cx="50"
							cy="50"
							r="46"
							fill="#5b5b5b"
							stroke="#d5d5d5"
							strokeWidth="1"
						/>
						<circle
							cx={50 + direction.x * 37}
							cy={50 - direction.y * 37}
							r="7"
							fill="white"
						/>
					</svg>
				</Button>
			</div>
		</section>
	);
}
