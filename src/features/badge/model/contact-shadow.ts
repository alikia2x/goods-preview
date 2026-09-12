import * as THREE from "three";
import { shadowFrustum } from "@/features/studio/lib/lighting";
import { KEY_DIRECTION, STAGE_FLOOR_Y, type Vector3Tuple } from "@/tuning";

// A depth-only pass of the actual badge. No background surface or lighting is
// rendered into this map. PCSS approximates area-source visibility at the receiver.
export class ContactShadow {
	readonly camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 1, 14);
	readonly target = new THREE.WebGLRenderTarget(2048, 2048, {
		depthTexture: new THREE.DepthTexture(2048, 2048, THREE.UnsignedIntType),
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
	});
	readonly scene = new THREE.Scene();
	readonly caster: THREE.Group;
	readonly depthMaterial = new THREE.MeshDepthMaterial({
		side: THREE.DoubleSide,
	});
	readonly material: THREE.ShaderMaterial;
	readonly plane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
	readonly wall: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
	private sceneCasters: THREE.Group | null = null;
	dirty = true;
	constructor(group: THREE.Group) {
		this.caster = group.clone(true);
		this.scene.add(this.caster);
		this.scene.overrideMaterial = this.depthMaterial;
		this.camera.position.set(...KEY_DIRECTION);
		this.camera.lookAt(0, 0, 0);
		this.camera.updateMatrixWorld();
		const shadowMatrix = new THREE.Matrix4().multiplyMatrices(
			this.camera.projectionMatrix,
			this.camera.matrixWorldInverse,
		);
		const samples = Array.from({ length: 64 }, (_, i) => {
			const r = Math.sqrt((i + 0.5) / 64),
				theta = i * 2.399963229728653;
			return new THREE.Vector2(r * Math.cos(theta), r * Math.sin(theta));
		});
		this.material = new THREE.ShaderMaterial({
			transparent: true,
			depthWrite: false,
			toneMapped: false,
			uniforms: {
				shadowDepth: { value: this.target.depthTexture },
				shadowMatrix: { value: shadowMatrix },
				disk: { value: samples },
				softness: { value: 0.11 },
				strength: { value: 0.26 },
			},
			vertexShader: `uniform mat4 shadowMatrix; varying vec3 shadowPosition;
    void main() {
     vec4 world = modelMatrix * vec4(position, 1.0);
     shadowPosition = (shadowMatrix * world).xyz * .5 + .5;
     gl_Position = projectionMatrix * viewMatrix * world;
    }`,
			fragmentShader: `uniform sampler2D shadowDepth;
    uniform vec2 disk[64]; uniform float softness; uniform float strength;
    varying vec3 shadowPosition;
    float depthAt(vec2 uv) {
     if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return 1.0;
     return texture2D(shadowDepth, uv).r;
    }
    // Interpolate comparison results, not depths: this retains occluder edges
    // while producing continuous coverage instead of 32 binary opacity steps.
    float filteredOcclusion(vec2 uv, float receiver) {
     vec2 pixel = uv * 2048.0 - .5;
     vec2 base = (floor(pixel) + .5) / 2048.0;
     vec2 f = fract(pixel);
     float a = step(depthAt(base) + .00015, receiver);
     float b = step(depthAt(base + vec2(1.0, 0.0)/2048.0) + .00015, receiver);
     float c = step(depthAt(base + vec2(0.0, 1.0)/2048.0) + .00015, receiver);
     float d = step(depthAt(base + vec2(1.0)/2048.0) + .00015, receiver);
     return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
    }
    void main() {
     vec3 p = shadowPosition;
     if (any(lessThan(p, vec3(0.0))) || any(greaterThan(p, vec3(1.0)))) discard;
     // Fixed in shadow space: breaks coherent sample rings without animation flicker.
     float noise = fract(52.9829189 * fract(dot(floor(p.xy * 4096.0), vec2(.06711056, .00583715))));
     float angle = noise * 6.2831853;
     mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
     float blockers = 0.0; float blockerDepth = 0.0;
     for (int i = 0; i < 16; i++) {
      float depth = depthAt(p.xy + rotation * disk[i * 4] * .045);
      if (depth < p.z - .00015) { blockerDepth += depth; blockers += 1.0; }
     }
     if (blockers == 0.0) discard;
     float separation = max(0.0, p.z - blockerDepth / blockers) * 13.0;
     float radius = clamp(separation * softness / 4.0, 1.5 / 2048.0, .045);
     float occlusion = 0.0;
     for (int i = 0; i < 64; i++) {
      occlusion += filteredOcclusion(p.xy + rotation * disk[i] * radius, p.z);
     }
     float boundary = min(min(p.x, 1.0-p.x), min(p.y, 1.0-p.y));
     float coverage = occlusion / 64.0 * smoothstep(0.0, .05, boundary);
     float alpha = strength * coverage;
     // Sub-LSB dithering of the final blend avoids 8-bit PNG/display banding.
     alpha += (noise - .5) / 255.0 * 4.0 * coverage * (1.0 - coverage) * strength;
     gl_FragColor = vec4(0.0, 0.0, 0.0, clamp(alpha, 0.0, 1.0));
    }`,
		});
		this.plane = new THREE.Mesh(
			new THREE.PlaneGeometry(200, 200),
			this.material,
		);
		this.wall = new THREE.Mesh(
			new THREE.PlaneGeometry(200, 200),
			this.material,
		);
		this.wall.visible = false;
		this.plane.userData.exportRole = "shadow";
		this.wall.userData.exportRole = "shadow";
	}
	update(
		scale: number,
		direction = new THREE.Vector3(...KEY_DIRECTION).normalize(),
		wallZ: number | null = null,
		center: Vector3Tuple = [0, STAGE_FLOOR_Y + scale, 0],
	) {
		const lightDistance = Math.sqrt(61);
		const position = direction.clone().multiplyScalar(lightDistance);
		// Refit the orthographic box around wherever the badge ended up, plus its
		// projection onto the receiver (the floor, and the backdrop wall when set).
		// The camera keeps looking at the origin, so the box is offset in the same
		// basis the frustum is measured in.
		const half = scale * 1.1;
		const frustum = shadowFrustum(
			direction,
			wallZ,
			[center[0] - half, center[1] - half, center[2] - half],
			[center[0] + half, center[1] + half, center[2] + half],
			lightDistance,
			STAGE_FLOOR_Y,
		);
		const camera = this.camera;
		camera.left = frustum.left;
		camera.right = frustum.right;
		camera.top = frustum.top;
		camera.bottom = frustum.bottom;
		camera.near = frustum.near;
		camera.far = frustum.far;
		camera.position.copy(position);
		camera.up.set(0, 1, 0);
		camera.lookAt(0, 0, 0);
		camera.updateProjectionMatrix();
		camera.updateMatrixWorld();
		this.material.uniforms.shadowMatrix.value.multiplyMatrices(
			camera.projectionMatrix,
			camera.matrixWorldInverse,
		);
		this.dirty = true;
		if (this.caster.scale.x !== scale) {
			this.caster.scale.setScalar(scale);
			this.dirty = true;
		}
	}
	setStageCasters(group: THREE.Group) {
		if (this.sceneCasters) this.scene.remove(this.sceneCasters);
		this.sceneCasters = group.clone(true);
		this.scene.add(this.sceneCasters);
		this.dirty = true;
	}
	setPose(group: THREE.Group, center: Vector3Tuple, windowScene: boolean) {
		if (
			!this.caster.quaternion.equals(group.quaternion) ||
			!this.caster.position.equals(group.position)
		) {
			this.caster.quaternion.copy(group.quaternion);
			this.caster.position.copy(group.position);
			this.dirty = true;
		}
		// Both supported poses rest on the horizontal set surface.
		this.plane.rotation.set(-Math.PI / 2, 0, 0);
		this.plane.position.set(center[0], STAGE_FLOOR_Y, center[2]);
		this.wall.position.set(0, 0, -1.999);
		this.wall.visible = windowScene;
		this.material.uniforms.softness.value = windowScene ? 0.038 : 0.11;
	}

	render(renderer: THREE.WebGLRenderer) {
		if (!this.dirty) return;
		const target = renderer.getRenderTarget();
		const clear = renderer.getClearColor(new THREE.Color()),
			alpha = renderer.getClearAlpha();
		const autoClear = renderer.autoClear;
		try {
			renderer.autoClear = true;
			renderer.setRenderTarget(this.target);
			renderer.setClearColor(0xffffff, 1);
			renderer.clear();
			renderer.render(this.scene, this.camera);
			this.dirty = false;
		} finally {
			renderer.setRenderTarget(target);
			renderer.setClearColor(clear, alpha);
			renderer.autoClear = autoClear;
		}
	}
	dispose() {
		this.target.dispose();
		this.depthMaterial.dispose();
		// Caster geometries/materials are shared with the badge and owned by its renderer.
		this.scene.clear();
	}
}
