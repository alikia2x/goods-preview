import * as THREE from "three";
import { applyOutputFraming } from "@/features/studio/lib/framing";

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
	const ratio = renderer.getPixelRatio(),
		alpha = renderer.getClearAlpha(),
		background = scene.background;
	const visibility = backgroundObjects.map((object) => object.visible);
	let pending: Promise<Blob>;
	try {
		if (transparent) {
			scene.background = null;
			renderer.setClearAlpha(0);
			for (const object of backgroundObjects) object.visible = false;
		}
		renderer.setPixelRatio(1);
		renderer.setSize(edge, edge, false);
		renderer.render(scene, outputCamera);
		pending = new Promise<Blob>((resolve, reject) =>
			renderer.domElement.toBlob(
				(blob) => (blob ? resolve(blob) : reject(new Error("导出失败。"))),
				"image/png",
			),
		);
	} finally {
		scene.background = background;
		renderer.setClearAlpha(alpha);
		backgroundObjects.forEach((object, index) => {
			object.visible = visibility[index];
		});
		renderer.setPixelRatio(ratio);
		renderer.setSize(dimensions.x, dimensions.y, false);
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
