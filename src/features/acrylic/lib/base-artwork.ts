import {
	decodeImage,
	imageThumbnail,
	validateImageFile,
} from "@/features/studio/lib/image";

export type BaseArtwork = {
	/** Keep the source bounds so transparent padding remains meaningful. */
	canvas: HTMLCanvasElement;
	thumbnail: string;
};

const BASE_TEXTURE_SIZE = 2048;

function sourceSize(source: HTMLCanvasElement | HTMLImageElement) {
	return {
		width:
			source instanceof HTMLImageElement ? source.naturalWidth : source.width,
		height:
			source instanceof HTMLImageElement ? source.naturalHeight : source.height,
	};
}

export function prepareBaseArtwork(
	source: HTMLCanvasElement | HTMLImageElement,
): BaseArtwork {
	const { width: sourceWidth, height: sourceHeight } = sourceSize(source);
	const scale = Math.min(
		1,
		BASE_TEXTURE_SIZE / Math.max(sourceWidth, sourceHeight),
	);
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(sourceWidth * scale));
	canvas.height = Math.max(1, Math.round(sourceHeight * scale));
	const context = canvas.getContext("2d");
	if (!context) throw new Error("无法创建底座图案。");
	context.drawImage(source, 0, 0, canvas.width, canvas.height);
	return { canvas, thumbnail: imageThumbnail(canvas) };
}

export async function readBaseArtwork(file: File) {
	const validationError = validateImageFile(file);
	if (validationError) throw new Error(validationError);
	return prepareBaseArtwork(await decodeImage(file));
}
