export function squareCrop(bounds: {
	left: number;
	top: number;
	width: number;
	height: number;
}) {
	const size = Math.min(bounds.width, bounds.height);
	return {
		left: bounds.left + (bounds.width - size) / 2,
		top: bounds.top + (bounds.height - size) / 2,
		width: size,
		height: size,
	};
}
