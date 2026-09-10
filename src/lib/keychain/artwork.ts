import {
	MAX_IMAGE_FILE_SIZE,
	MAX_IMAGE_PIXELS,
	SUPPORTED_IMAGE_TYPES,
} from "../badge/constants";
import type { ArtworkMask } from "./geometry";

export type KeychainArtwork = {
	canvas: HTMLCanvasElement;
	mask: ArtworkMask;
	name: string;
	thumbnail: string;
};

export function prepareArtwork(
	source: HTMLCanvasElement | HTMLImageElement,
	name: string,
): KeychainArtwork {
	const sourceWidth =
		source instanceof HTMLImageElement ? source.naturalWidth : source.width;
	const sourceHeight =
		source instanceof HTMLImageElement ? source.naturalHeight : source.height;
	const scan = document.createElement("canvas");
	const ratio = Math.min(1, 1024 / Math.max(sourceWidth, sourceHeight));
	scan.width = Math.max(1, Math.round(sourceWidth * ratio));
	scan.height = Math.max(1, Math.round(sourceHeight * ratio));
	const ctx = scan.getContext("2d", { willReadFrequently: true });
	if (!ctx) throw new Error("无法读取图像。");
	ctx.drawImage(source, 0, 0, scan.width, scan.height);
	const pixels = ctx.getImageData(0, 0, scan.width, scan.height).data;
	let minX = scan.width,
		minY = scan.height,
		maxX = -1,
		maxY = -1;
	for (let y = 0; y < scan.height; y++)
		for (let x = 0; x < scan.width; x++)
			if (pixels[(y * scan.width + x) * 4 + 3] >= 32) {
				minX = Math.min(minX, x);
				maxX = Math.max(maxX, x);
				minY = Math.min(minY, y);
				maxY = Math.max(maxY, y);
			}
	if (maxX < 0) throw new Error("图片完全透明，请选择有可见图案的图片。");
	const canvas = document.createElement("canvas");
	const cropWidth = (maxX - minX + 1) / ratio,
		cropHeight = (maxY - minY + 1) / ratio;
	const outputScale = Math.min(1, 2048 / Math.max(cropWidth, cropHeight));
	canvas.width = Math.max(1, Math.round(cropWidth * outputScale));
	canvas.height = Math.max(1, Math.round(cropHeight * outputScale));
	canvas
		.getContext("2d")
		?.drawImage(
			source,
			minX / ratio,
			minY / ratio,
			cropWidth,
			cropHeight,
			0,
			0,
			canvas.width,
			canvas.height,
		);
	const scale = 256 / Math.max(canvas.width, canvas.height);
	scan.width = Math.max(1, Math.round(canvas.width * scale));
	scan.height = Math.max(1, Math.round(canvas.height * scale));
	ctx.drawImage(canvas, 0, 0, scan.width, scan.height);
	const rgba = ctx.getImageData(0, 0, scan.width, scan.height).data;
	const alpha = new Uint8Array(scan.width * scan.height);
	for (let i = 0; i < alpha.length; i++) alpha[i] = rgba[i * 4 + 3];
	return {
		canvas,
		mask: { width: scan.width, height: scan.height, alpha },
		name,
		thumbnail: scan.toDataURL(),
	};
}

export async function readKeychainArtwork(file: File) {
	if (!SUPPORTED_IMAGE_TYPES.includes(file.type))
		throw new Error("请选择 PNG、JPG 或 WebP 图像。");
	if (file.size > MAX_IMAGE_FILE_SIZE)
		throw new Error("图像大小不能超过 20 MB。");
	const url = URL.createObjectURL(file),
		image = new Image();
	try {
		image.src = url;
		await image.decode();
		if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS)
			throw new Error("图像像素过大，请缩小至 6400 万像素以内。");
		return prepareArtwork(image, file.name);
	} finally {
		URL.revokeObjectURL(url);
	}
}

export function defaultKeychainArtwork() {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 768;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("无法创建默认图案。");
	ctx.beginPath();
	for (let i = 0; i < 10; i++) {
		const a = -Math.PI / 2 + (i * Math.PI) / 5,
			r = i % 2 ? 200 : 350;
		const x = 384 + Math.cos(a) * r,
			y = 390 + Math.sin(a) * r;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.closePath();
	ctx.fillStyle = "#F36557";
	ctx.fill();
	ctx.fillStyle = "#292929";
	ctx.beginPath();
	ctx.arc(314, 357, 18, 0, Math.PI * 2);
	ctx.arc(454, 357, 18, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = "#292929";
	ctx.lineWidth = 14;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.arc(384, 390, 48, 0.15, Math.PI - 0.15);
	ctx.stroke();
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.font = "bold 36px sans-serif";
	ctx.fillText("GOOD DAY", 384, 510);
	return prepareArtwork(canvas, "默认图案");
}
