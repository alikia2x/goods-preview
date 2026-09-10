import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ContactShadow } from "./contact-shadow";
import { FINISHES, type Finish, finishMaterial } from "./finishes";
import { squareCrop } from "./framing";
import { lightDirection, lightRotation } from "./lighting";
import { SCENES, type SceneKind } from "./scenes";
import { SceneStage } from "./stage";
import { exportDimensions, studioEnvironment } from "./studio";
import type { Settings } from "./types";

export type { Settings } from "./types";

// An oblate ellipsoid continues past its equator into the tucked-under lip.
// The analytic normals remain continuous at the pole, seam and outer shoulder.
export function badgeGeometry() {
	const positions: number[] = [],
		normals: number[] = [],
		uv: number[] = [],
		indices: number[] = [];
	const rings = 96,
		segments = 192;
	const normal = new THREE.Vector3();
	for (let r = 0; r <= rings; r++) {
		const theta = (r / rings) * 1.84;
		const radius = Math.sin(theta),
			z = -0.02 + 0.13 * Math.cos(theta);
		for (let s = 0; s <= segments; s++) {
			const a = (s / segments) * Math.PI * 2;
			const x = radius * Math.cos(a),
				y = radius * Math.sin(a);
			positions.push(x, y, z);
			normal.set(x, y, Math.cos(theta) / 0.13).normalize();
			normals.push(normal.x, normal.y, normal.z);
			uv.push(x / 2 + 0.5, y / 2 + 0.5);
			if (r < rings && s < segments) {
				const i = r * (segments + 1) + s;
				if (r > 0) indices.push(i, i + segments + 1, i + 1);
				indices.push(i + 1, i + segments + 1, i + segments + 2);
			}
		}
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3),
	);
	geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
	geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
	geometry.setIndex(indices);
	return geometry;
}

export function defaultArtwork() {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 2048;
	const c = canvas.getContext("2d");
	if (!c) throw new Error("无法创建图像");
	c.fillStyle = "#f36557";
	c.fillRect(0, 0, 2048, 2048);
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

export class BadgeRenderer {
	renderer: THREE.WebGLRenderer;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
	controls: OrbitControls;
	group = new THREE.Group();
	material: THREE.MeshPhysicalMaterial;
	texture: THREE.CanvasTexture;
	artwork: CanvasImageSource = defaultArtwork();
	private artworkState?: {
		source: CanvasImageSource;
		zoom: number;
		x: number;
		y: number;
	};
	framing: HTMLElement;
	observer: ResizeObserver;
	frame = 0;
	environments: Record<Finish, THREE.WebGLRenderTarget>;
	finish: Finish = "glossy";
	shadow: ContactShadow;
	stage = new SceneStage();
	sceneKind: SceneKind = "plain";
	disposed = false;
	host: HTMLDivElement;
	constructor(host: HTMLDivElement, framing: HTMLElement) {
		this.host = host;
		this.framing = framing;
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true,
			preserveDrawingBuffer: true,
		});
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		this.renderer.toneMapping = THREE.NeutralToneMapping;
		this.renderer.toneMappingExposure = 1;
		host.appendChild(this.renderer.domElement);
		this.renderer.domElement.setAttribute("aria-label", "徽章 3D 预览");
		this.environments = {
			matte: studioEnvironment(this.renderer, "matte"),
			glossy: studioEnvironment(this.renderer, "glossy"),
		};
		this.scene.environment = this.environments.glossy.texture;
		this.texture = new THREE.CanvasTexture(defaultArtwork());
		this.texture.colorSpace = THREE.SRGBColorSpace;
		this.texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
		this.material = new THREE.MeshPhysicalMaterial({
			map: this.texture,
			...finishMaterial("glossy", FINISHES.glossy.defaultGloss),
		});
		const face = new THREE.Mesh(badgeGeometry(), this.material);
		this.group.add(face);
		const metal = new THREE.MeshStandardMaterial({
			color: "#b8bdc2",
			metalness: 1,
			roughness: 0.27,
		});
		const back = new THREE.Mesh(
			new THREE.CylinderGeometry(0.95, 0.95, 0.04, 192),
			metal,
		);
		back.rotation.x = Math.PI / 2;
		back.position.z = -0.075;
		this.group.add(back);
		const rim = new THREE.Mesh(
			new THREE.TorusGeometry(0.932, 0.022, 16, 192),
			metal,
		);
		rim.position.z = -0.088;
		this.group.add(rim);
		const pin = new THREE.Mesh(
			new THREE.CylinderGeometry(0.013, 0.013, 1.15, 12),
			metal,
		);
		pin.rotation.z = Math.PI / 2;
		pin.position.z = -0.155;
		this.group.add(pin);
		for (const x of [-0.56, 0.56]) {
			const clasp = new THREE.Mesh(
				new THREE.BoxGeometry(0.11, 0.17, 0.09),
				metal,
			);
			clasp.position.set(x, 0, -0.12);
			this.group.add(clasp);
		}
		this.scene.add(this.group);
		this.shadow = new ContactShadow(this.group);
		this.scene.add(this.shadow.plane, this.shadow.wall, this.stage.group);
		this.camera.position.set(0.35, 0.55, 4.9);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.minDistance = 2;
		this.controls.maxDistance = 9;
		this.controls.maxPolarAngle = Math.PI;
		this.controls.saveState();
		this.observer = new ResizeObserver(() => this.resize());
		this.observer.observe(host);
		this.observer.observe(framing);
		this.resize();
		const animate = () => {
			if (this.disposed) return;
			this.frame = requestAnimationFrame(animate);
			this.controls.update();
			this.shadow.render(this.renderer);
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}
	resize() {
		const { clientWidth: w, clientHeight: h } = this.host;
		if (!w || !h) return;
		// Shift the full-screen projection so the subject is centered in the unobscured area.
		const crop = squareCrop(this.framing.getBoundingClientRect());
		this.camera.setViewOffset(
			w,
			h,
			w / 2 - (crop.left + crop.width / 2),
			h / 2 - (crop.top + crop.height / 2),
			w,
			h,
		);
		this.camera.zoom = Math.min(1, crop.height / h) * (w <= 700 ? 1.05 : 1);
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h);
	}
	update(s: Settings) {
		this.scene.background = new THREE.Color(SCENES[s.scene].background);
		const changedScene = this.sceneKind !== s.scene;
		this.sceneKind = s.scene;
		const standing = SCENES[s.scene].standing;
		this.stage.pose(this.group, s.scene, s.size / 65);
		if (this.stage.configure(s.scene, s.size / 65))
			this.shadow.setStageCasters(this.stage.casters);
		if (changedScene) {
			// Consume pending orbit damping before applying a scene's camera pose.
			this.controls.enableDamping = false;
			this.controls.update();
			this.controls.target.set(0, 0, 0);
			this.camera.position.set(
				...((s.scene === "table"
					? [0.12, 0.4, 5.2]
					: standing
						? [0.2, 0.55, 4.9]
						: [0.35, 0.55, 4.9]) as [number, number, number]),
			);
			this.controls.update();
			this.controls.enableDamping = true;
		}
		// Scale the whole lighting rig together; 50% is the neutral studio setup.
		const illumination =
			2 ** ((s.light - 50) / 50) * (s.scene === "studio" ? 1.2 : 1);
		this.scene.environmentIntensity = illumination;
		// One light direction drives both environment reflection and shadow projection.
		const direction = lightDirection(s.lightAzimuth, s.lightElevation);
		this.scene.environmentRotation.setFromQuaternion(lightRotation(direction));
		const preset = FINISHES[s.finish];
		this.finish = s.finish;
		this.scene.environment = this.environments[s.finish].texture;
		this.material.setValues(finishMaterial(s.finish, s.gloss));
		this.renderer.toneMappingExposure = preset.exposure;
		this.shadow.update(s.size / 65, direction);
		this.shadow.setPose(this.group, standing, s.scene === "studio");
		this.shadow.material.uniforms.strength.value = s.shadow / 100;
		this.shadow.plane.visible = s.shadow > 0 && s.scene !== "studio";
		this.shadow.wall.visible = s.scene === "studio" && s.shadow > 0;
		this.group.scale.setScalar(s.size / 65);
		const previous = this.artworkState;
		if (
			previous?.source === this.artwork &&
			previous.zoom === s.zoom &&
			previous.x === s.x &&
			previous.y === s.y
		)
			return;
		const canvas = document.createElement("canvas");
		canvas.width = canvas.height = 2048;
		const c = canvas.getContext("2d");
		if (!c) return;
		const source = this.artwork as HTMLImageElement | HTMLCanvasElement;
		const w =
				source instanceof HTMLImageElement ? source.naturalWidth : source.width,
			h =
				source instanceof HTMLImageElement
					? source.naturalHeight
					: source.height;
		const scale = Math.max(2048 / w, 2048 / h) * s.zoom;
		c.fillStyle = "#ffffff";
		c.fillRect(0, 0, 2048, 2048);
		c.drawImage(
			source,
			(2048 - w * scale) / 2 + s.x * 20.48,
			(2048 - h * scale) / 2 + s.y * 20.48,
			w * scale,
			h * scale,
		);
		this.texture.image = canvas;
		this.texture.needsUpdate = true;
		this.artworkState = { source: this.artwork, zoom: s.zoom, x: s.x, y: s.y };
	}
	view(view: string) {
		this.controls.enableDamping = false;
		this.controls.update();
		this.controls.target.set(0, 0, 0);

		if (view === "front") {
			this.camera.position.set(0, 0, 4.9);
		} else if (view === "back") {
			this.camera.position.set(0, 0, -4.9);
		} else {
			if (SCENES[this.sceneKind].standing)
				this.camera.position.set(0.3, 0.5, 4.9);
			else this.camera.position.set(0.3, -1.15, 4.7);
		}

		this.controls.update();
		this.controls.enableDamping = true;
	}
	async export(size: number) {
		const ratio = this.renderer.getPixelRatio();
		const w = this.host.clientWidth,
			h = this.host.clientHeight;
		const crop = squareCrop(this.framing.getBoundingClientRect());
		const output = exportDimensions(size);
		const camera = this.camera.clone();
		const view = this.camera.view;
		camera.setViewOffset(
			w,
			h,
			(view?.offsetX ?? 0) + crop.left,
			(view?.offsetY ?? 0) + crop.top,
			crop.width,
			crop.height,
		);
		const background = this.scene.background;
		const shadowVisible = this.shadow.plane.visible,
			wallVisible = this.shadow.wall.visible;
		const stageVisible = this.stage.group.visible;
		const clearAlpha = this.renderer.getClearAlpha();
		let pending: Promise<Blob>;
		try {
			if (this.sceneKind === "transparent") {
				this.scene.background = null;
				this.renderer.setClearAlpha(0);
				this.shadow.wall.visible = false;
				this.stage.group.visible = false;
			}
			this.renderer.setPixelRatio(1);
			this.renderer.setSize(output.width, output.height, false);
			this.shadow.render(this.renderer);
			this.renderer.render(this.scene, camera);
			// toBlob snapshots synchronously; restore the live viewport before awaiting encoding.
			pending = new Promise<Blob>((resolve, reject) =>
				this.renderer.domElement.toBlob(
					(blob) => (blob ? resolve(blob) : reject(new Error("导出失败"))),
					"image/png",
				),
			);
		} finally {
			this.scene.background = background;
			this.renderer.setClearAlpha(clearAlpha);
			this.shadow.plane.visible = shadowVisible;
			this.shadow.wall.visible = wallVisible;
			this.stage.group.visible = stageVisible;
			this.renderer.setPixelRatio(ratio);
			this.resize();
		}
		const blob = await pending;
		const url = URL.createObjectURL(blob),
			a = document.createElement("a");
		a.href = url;
		a.download = `${this.finish}-badge-${this.sceneKind}-${output.width}x${output.height}.png`;
		a.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	}

	dispose() {
		this.disposed = true;
		cancelAnimationFrame(this.frame);
		this.observer.disconnect();
		this.controls.dispose();
		this.scene.remove(this.stage.group);
		this.stage.dispose();
		this.scene.traverse((o) => {
			if (o instanceof THREE.Mesh) {
				o.geometry.dispose();
				for (const m of Array.isArray(o.material) ? o.material : [o.material])
					m.dispose();
			}
		});
		this.texture.dispose();
		this.environments.matte.dispose();
		this.environments.glossy.dispose();
		this.shadow.dispose();
		this.renderer.dispose();
		this.renderer.domElement.remove();
	}
}
