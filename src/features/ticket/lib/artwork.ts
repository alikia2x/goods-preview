// Bleed is printed past the finished ticket on both sides, so the artwork is
// magnified about the centre until the die line lands inside it. The canvas is
// grown to hold the magnified print at its own resolution.
export function composeTicketTexture(
	artwork: HTMLImageElement | HTMLCanvasElement,
	bleed: number,
	size: number,
) {
	const width =
		artwork instanceof HTMLImageElement ? artwork.naturalWidth : artwork.width;
	const height =
		artwork instanceof HTMLImageElement
			? artwork.naturalHeight
			: artwork.height;
	const scale = 1 + (2 * bleed) / size;
	const renderedWidth = width * scale;
	const renderedHeight = height * scale;
	const canvas = document.createElement("canvas");
	canvas.width = Math.ceil(renderedWidth);
	canvas.height = Math.ceil(renderedHeight);
	const context = canvas.getContext("2d");
	if (!context) return canvas;
	const insetX = canvas.width * ((scale - 1) / (2 * scale));
	const insetY = canvas.height * ((scale - 1) / (2 * scale));
	context.imageSmoothingQuality = "high";
	context.drawImage(
		artwork,
		insetX,
		insetY,
		width * (canvas.width / renderedWidth),
		height * (canvas.height / renderedHeight),
	);
	return canvas;
}
