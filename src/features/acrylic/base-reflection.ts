import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";

// A local planar reflection supplies the printed artwork that an environment
// map cannot contain. Blend by PMMA's Fresnel reflectance, retaining transmission.
export function createBaseReflection(shape: THREE.Shape) {
	const reflector = new Reflector(new THREE.ShapeGeometry(shape, 96), {
		textureWidth: 1024,
		textureHeight: 1024,
		multisample: 0,
		clipBias: 0.001,
	});
	const material = reflector.material as THREE.ShaderMaterial;
	material.uniforms.reflectionStrength = { value: 1 };
	material.transparent = true;
	material.depthWrite = false;
	material.vertexShader = material.vertexShader
		.replace(
			"varying vec4 vUv;",
			"varying vec4 vUv; varying vec3 toEye; varying vec3 worldNormal;",
		)
		.replace(
			"vUv = textureMatrix",
			"toEye = cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz; worldNormal = normalize(mat3(modelMatrix) * normal); vUv = textureMatrix",
		);
	material.fragmentShader = `uniform float reflectionStrength; uniform sampler2D tDiffuse; varying vec4 vUv; varying vec3 toEye; varying vec3 worldNormal;
 void main() {
  vec4 reflected = texture2DProj(tDiffuse, vUv);
  float cosine = abs(dot(normalize(toEye), normalize(worldNormal)));
  float fresnel = 0.039 + 0.961 * pow(1.0 - cosine, 5.0);
  gl_FragColor = vec4(reflected.rgb, fresnel * reflected.a * reflectionStrength);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;
	const render = reflector.onBeforeRender;
	let busy = false;
	reflector.onBeforeRender = function (
		renderer,
		scene,
		camera,
		geometry,
		mat,
		group,
	) {
		if (busy || renderer.getRenderTarget() !== null) return;
		busy = true;
		const visible = this.visible;
		try {
			render.call(this, renderer, scene, camera, geometry, mat, group);
		} finally {
			this.visible = visible;
			busy = false;
		}
	};
	reflector.renderOrder = 2;
	return reflector;
}
