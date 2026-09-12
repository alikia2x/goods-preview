import * as THREE from "three";
import { applyOutputFraming } from "@/features/studio/lib/framing";
import { captureTransparent } from "@/features/studio/lib/transparent-capture";

export const EXPORT_RESOLUTIONS = ["1024", "2048", "4096"] as const;

export async function captureSquare({
	context,
	output,
	backgroundObjects,
}: {
	context: {
		renderer: THREE.WebGLRenderer;
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		framing: HTMLElement;
	};
	output: { edge: number; transparent: boolean };
	backgroundObjects: THREE.Object3D[];
}) {
	const { renderer, scene, camera, framing } = context;
	const { edge, transparent } = output;
	if (!EXPORT_RESOLUTIONS.map(Number).includes(edge))
		throw new Error("不支持的导出尺寸。");
	const dimensions = renderer.getSize(new THREE.Vector2());
	const outputCamera = camera.clone();
	applyOutputFraming(
		outputCamera,
		{ width: dimensions.x, height: dimensions.y },
		framing.getBoundingClientRect(),
		camera.view,
	);
	const ratio = renderer.getPixelRatio();
	let pending: Promise<Blob>;
	try {
		renderer.setPixelRatio(1);
		renderer.setSize(edge, edge, false);
		// Refresh planar reflections before the final full-scene transmission pass.
		renderer.render(scene, outputCamera);
		renderer.render(scene, outputCamera);
		const canvas = transparent
			? captureTransparent(renderer, scene, outputCamera, backgroundObjects)
			: renderer.domElement;
		pending = new Promise<Blob>((resolve, reject) =>
			canvas.toBlob(
				(blob) => (blob ? resolve(blob) : reject(new Error("导出失败。"))),
				"image/png",
			),
		);
	} finally {
		renderer.setPixelRatio(ratio);
		renderer.setSize(dimensions.x, dimensions.y, false);
		// The coverage pass refreshed reflector textures with masks. Rebuild those
		// before transmission samples them in the restored preview.
		if (transparent) renderer.render(scene, camera);
		renderer.render(scene, camera);
	}
	return pending;
}

export function downloadPng(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob),
		link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
