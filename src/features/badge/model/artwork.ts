export const BADGE_TEXTURE_EDGE = 2048;

// Bleed extends past the finished diameter on both sides of the badge. Pure so
// the scaling can be verified without a canvas.
export function badgeArtworkScale(
	width: number,
	height: number,
	size: number,
	bleed: number,
) {
	return (
		Math.max(BADGE_TEXTURE_EDGE / width, BADGE_TEXTURE_EDGE / height) *
		(1 + (2 * bleed) / size)
	);
}

// Flatten the artwork onto the square badge texture, centred and scaled to fill.
export function composeBadgeTexture(
	source: HTMLImageElement | HTMLCanvasElement,
	size: number,
	bleed: number,
) {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = BADGE_TEXTURE_EDGE;
	const context = canvas.getContext("2d");
	if (!context) return canvas;
	const width =
		source instanceof HTMLImageElement ? source.naturalWidth : source.width;
	const height =
		source instanceof HTMLImageElement ? source.naturalHeight : source.height;
	const scale = badgeArtworkScale(width, height, size, bleed);
	context.fillStyle = "#ffffff";
	context.fillRect(0, 0, BADGE_TEXTURE_EDGE, BADGE_TEXTURE_EDGE);
	context.drawImage(
		source,
		(BADGE_TEXTURE_EDGE - width * scale) / 2,
		(BADGE_TEXTURE_EDGE - height * scale) / 2,
		width * scale,
		height * scale,
	);
	return canvas;
}

export function defaultArtwork() {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = BADGE_TEXTURE_EDGE;
	const c = canvas.getContext("2d");
	if (!c) throw new Error("无法创建图像");
	c.fillStyle = "#f36557";
	c.fillRect(0, 0, BADGE_TEXTURE_EDGE, BADGE_TEXTURE_EDGE);
	c.fillStyle = "#292929";
	c.beginPath();
	c.arc(1560, 480, 640, 0, Math.PI * 2);
	c.fill();
	c.fillStyle = "#f8f4e9";
	c.font = "bold 350px sans-serif";
	c.fillText("GOOD", 200, 1040);
	c.fillText("THINGS", 200, 1390);
	c.font = "40px sans-serif";
	c.fillText("GOODS PREVIEW    /    001", 225, 1610);
	c.strokeStyle = "#f8f4e9";
	c.lineWidth = 9;
	c.beginPath();
	c.arc(465, 470, 160, 0, Math.PI * 2);
	c.stroke();
	return canvas;
}
