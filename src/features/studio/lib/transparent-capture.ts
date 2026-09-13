import * as THREE from "three";

function copyCanvas(source: HTMLCanvasElement) {
	const canvas = document.createElement("canvas");
	canvas.width = source.width;
	canvas.height = source.height;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("无法创建导出画布。");
	context.drawImage(source, 0, 0);
	return { canvas, context };
}

// Keep the beauty pass intact, including scenery seen through clear acrylic.
// Subsequent passes describe coverage and cast shadows, never product colour.
export function captureTransparent(
	renderer: THREE.WebGLRenderer,
	scene: THREE.Scene,
	camera: THREE.Camera,
	backgroundObjects: THREE.Object3D[],
) {
	const beauty = copyCanvas(renderer.domElement);
	const background = new Set<THREE.Object3D>();
	for (const root of backgroundObjects)
		root.traverse((object) => background.add(object));
	const meshes: THREE.Mesh[] = [];
	scene.traverse((object) => {
		if (object instanceof THREE.Mesh) meshes.push(object);
	});
	const saved = meshes.map((mesh) => ({
		mesh,
		material: mesh.material,
		visible: mesh.visible,
		onBeforeRender: mesh.onBeforeRender,
	}));
	const temporary: THREE.Material[] = [];
	const sceneBackground = scene.background;
	const clear = renderer.getClearColor(new THREE.Color());
	const alpha = renderer.getClearAlpha();
	const shadowUpdate = renderer.shadowMap.autoUpdate;
	const shadowNeedsUpdate = renderer.shadowMap.needsUpdate;
	const maskMaterial = (source: THREE.Material) => {
		const surface = source as THREE.MeshStandardMaterial;
		const material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			side: source.side,
			alphaMap: surface.alphaMap ?? null,
			// Preserve cut-out artwork without copying its colour into the mask.
			map: surface.map ?? null,
			alphaTest: source.alphaTest,
			alphaToCoverage: source.alphaToCoverage,
			toneMapped: false,
		});
		material.onBeforeCompile = (shader) => {
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <map_fragment>",
				"#ifdef USE_MAP\n diffuseColor.a *= texture2D(map, vMapUv).a;\n#endif",
			);
		};
		temporary.push(material);
		return material;
	};
	try {
		scene.background = null;
		renderer.setClearColor(0x000000, 0);
		// Reuse the complete scene's shadow maps, including optical depth materials.
		renderer.shadowMap.autoUpdate = false;
		renderer.shadowMap.needsUpdate = false;
		for (const { mesh, material } of saved) {
			if (mesh.userData.exportRole === "reflection") {
				(mesh.material as THREE.ShaderMaterial).uniforms.exportMask.value =
					true;
				continue;
			}
			if (background.has(mesh) || mesh.userData.exportRole === "shadow") {
				mesh.visible = false;
				continue;
			}
			// Local product reflectors are covered by the solid acrylic geometry.
			mesh.onBeforeRender = () => {};
			mesh.material = Array.isArray(material)
				? material.map(maskMaterial)
				: maskMaterial(material);
		}
		renderer.render(scene, camera);
		const coverage = copyCanvas(renderer.domElement);
		beauty.context.globalCompositeOperation = "destination-in";
		beauty.context.drawImage(coverage.canvas, 0, 0);

		// Render only shadow receivers. Product casters remain in the frozen map.
		for (const { mesh, material, visible } of saved) {
			mesh.material = material;
			mesh.onBeforeRender = () => {};
			mesh.visible = false;
			if (mesh.userData.exportRole === "reflection") {
				(mesh.material as THREE.ShaderMaterial).uniforms.exportMask.value =
					false;
			} else if (mesh.userData.exportRole === "shadow") {
				mesh.visible = visible;
			} else if (
				background.has(mesh) &&
				mesh.receiveShadow &&
				mesh.userData.exportShadow !== false
			) {
				const catcher = new THREE.ShadowMaterial({
					color: 0x000000,
					depthWrite: false,
				});
				temporary.push(catcher);
				mesh.material = catcher;
				mesh.visible = visible;
			}
		}
		renderer.render(scene, camera);
		const output = copyCanvas(renderer.domElement);
		output.context.drawImage(beauty.canvas, 0, 0);
		return output.canvas;
	} finally {
		for (const { mesh, material, visible, onBeforeRender } of saved) {
			mesh.material = material;
			mesh.visible = visible;
			mesh.onBeforeRender = onBeforeRender;
			if (mesh.userData.exportRole === "reflection") {
				(mesh.material as THREE.ShaderMaterial).uniforms.exportMask.value =
					false;
			}
		}
		scene.background = sceneBackground;
		renderer.setClearColor(clear, alpha);
		renderer.shadowMap.autoUpdate = shadowUpdate;
		renderer.shadowMap.needsUpdate = shadowNeedsUpdate;
		for (const material of temporary) material.dispose();
	}
}
