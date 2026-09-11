export const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
export const MAX_IMAGE_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 64_000_000;

export function validateImageFile(file: File): string | null {
	if (!SUPPORTED_IMAGE_TYPES.includes(file.type))
		return "请选择 PNG、JPG 或 WebP 图像。";
	if (file.size > MAX_IMAGE_FILE_SIZE) return "图像大小不能超过 20 MB。";
	return null;
}

export async function decodeImage(file: File): Promise<HTMLImageElement> {
	const url = URL.createObjectURL(file);
	const image = new Image();
	try {
		image.src = url;
		await image.decode();
		if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS)
			throw new Error("图像像素过大，请缩小至 6400 万像素以内。");
		return image;
	} finally {
		URL.revokeObjectURL(url);
	}
}
