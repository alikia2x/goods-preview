// Bleed is printed past the finished ticket on both sides, so the artwork is
// magnified about the centre until the die line lands inside it. The texture
// canvas stays at the finished-ticket crop; anything beyond its edge is clipped
// just like the part of the print that is cut away.
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
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");
	if (!context) return canvas;
	const renderedWidth = width * scale;
	const renderedHeight = height * scale;
	context.imageSmoothingQuality = "high";
	context.drawImage(
		artwork,
		(canvas.width - renderedWidth) / 2,
		(canvas.height - renderedHeight) / 2,
		renderedWidth,
		renderedHeight,
	);
	return canvas;
}
