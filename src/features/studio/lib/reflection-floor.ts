import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";

// Render the actual scene from a reflected camera; blur the planar reflection,
// rather than drawing a duplicate model or a synthetic shadow on the tabletop.
export function createReflectionFloor(y: number) {
	const floor = new Reflector(new THREE.PlaneGeometry(200, 200), {
		textureWidth: 256,
		textureHeight: 256,
		multisample: 0,
		clipBias: 0.003,
	});
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = y;
	// Inside another render pass (for example the transmission buffer or the
	// nested reflection itself), skip the extra scene render entirely. A stale
	// one-frame reflection beats a GPU-level re-entry, which watchdogs Safari.
	const render = floor.onBeforeRender;
	let rendering = false;
	floor.onBeforeRender = function (
		renderer,
		scene,
		camera,
		geometry,
		material,
		group,
	) {
		if (rendering || renderer.getRenderTarget() !== null) return;
		rendering = true;
		const shadowUpdate = renderer.shadowMap.autoUpdate;
		renderer.shadowMap.autoUpdate = false;
		try {
			render.call(this, renderer, scene, camera, geometry, material, group);
		} finally {
			renderer.shadowMap.autoUpdate = shadowUpdate;
			rendering = false;
		}
	};
	const material = floor.material as THREE.ShaderMaterial;
	material.vertexShader = material.vertexShader
		.replace("varying vec4 vUv;", "varying vec4 vUv; varying vec3 toEye;")
		.replace(
			"vUv = textureMatrix",
			"toEye = cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz; vUv = textureMatrix",
		);
	material.fragmentShader = `uniform sampler2D tDiffuse; varying vec4 vUv; varying vec3 toEye;
	void main(){
	 vec2 uv=vUv.xy/vUv.w; vec3 reflected=vec3(0.0); float sum=0.0;
	 for(int x=-2;x<=2;x++) for(int y=-2;y<=2;y++){
		vec2 offset=vec2(float(x),float(y));float weight=exp(-dot(offset,offset)/2.0);
		reflected+=texture2D(tDiffuse,uv+offset*1.5/256.0).rgb*weight;sum+=weight;
	 }
	 float fresnel=.12+.3*pow(1.0-abs(normalize(toEye).y),3.0);
	 gl_FragColor=vec4(vec3(.0025)+reflected/sum*fresnel,1.0);
	 #include <tonemapping_fragment>
	 #include <colorspace_fragment>
	}`;
	return floor;
}
