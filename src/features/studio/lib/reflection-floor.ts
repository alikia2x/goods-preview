import * as THREE from "three";
import { Reflector } from "three/addons/objects/Reflector.js";

// Render the actual scene from a reflected camera; blur the planar reflection,
// rather than drawing a duplicate model or a synthetic shadow on the tabletop.
export function createReflectionFloor(y: number) {
	const floor = new Reflector(new THREE.PlaneGeometry(200, 200), {
		textureWidth: 1024,
		textureHeight: 1024,
		multisample: 0,
		clipBias: 0.003,
	});
	// Read only the fully rendered base level. Explicit mip reads of this HDR
	// attachment are avoided while investigating the reported coloured blocks.
	const reflectionTexture = floor.getRenderTarget().texture;
	reflectionTexture.generateMipmaps = false;
	reflectionTexture.minFilter = THREE.LinearFilter;
	reflectionTexture.magFilter = THREE.LinearFilter;
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = y;
	// Inside another render pass (for example the transmission buffer or the
	// nested reflection itself), skip the extra scene render entirely. A stale
	// one-frame reflection beats a GPU-level re-entry, which watchdogs Safari.
	const bufferSize = new THREE.Vector2();
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
		renderer.getDrawingBufferSize(bufferSize);
		const target = floor.getRenderTarget();
		const width = Math.min(2048, Math.max(512, Math.ceil(bufferSize.x)));
		const height = Math.min(2048, Math.max(512, Math.ceil(bufferSize.y)));
		if (target.width !== width || target.height !== height)
			target.setSize(width, height);
		(floor.material as THREE.ShaderMaterial).uniforms.reflectionTexel.value.set(
			1 / width,
			1 / height,
		);
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
	floor.userData.exportRole = "reflection";
	material.uniforms.reflectionTexel = {
		value: new THREE.Vector2(1 / 1024, 1 / 1024),
	};
	material.uniforms.exportMask = { value: false };
	material.vertexShader = material.vertexShader
		.replace("varying vec4 vUv;", "varying vec4 vUv; varying vec3 toEye;")
		.replace(
			"vUv = textureMatrix",
			"toEye = cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz; vUv = textureMatrix",
		);
	material.fragmentShader = `uniform vec2 reflectionTexel; uniform bool exportMask; uniform sampler2D tDiffuse; varying vec4 vUv; varying vec3 toEye;
	void main(){
	 if(vUv.w<=0.0) discard;
	 vec2 uv=vUv.xy/vUv.w; vec3 reflected=vec3(0.0); float sum=0.0; float coverage=0.0;
	 for(int x=-4;x<=4;x++) for(int y=-4;y<=4;y++){
		vec2 offset=vec2(float(x),float(y));float weight=exp(-dot(offset,offset)/8.0);
		vec2 sampleUv=uv+offset*reflectionTexel;
        vec4 sampleColor=vec4(0.0);
        if(all(greaterThanEqual(sampleUv,vec2(0.0))) && all(lessThanEqual(sampleUv,vec2(1.0)))) {
         sampleColor=texture2D(tDiffuse,sampleUv);
         // A non-finite HDR pixel must not contaminate the entire blur kernel.
         if(any(isnan(sampleColor)) || any(isinf(sampleColor))) sampleColor=vec4(0.0);
        }
		reflected+=sampleColor.rgb*weight;sum+=weight;
		coverage+=sampleColor.a*weight;
	 }
	 float fresnel=.12+.3*pow(1.0-abs(normalize(toEye).y),3.0);
	 gl_FragColor=vec4(vec3(.0025)+reflected/sum*fresnel,1.0);
	 if(exportMask) { gl_FragColor=vec4(vec3(1.0),coverage/sum); return; }
	 #include <tonemapping_fragment>
	 #include <colorspace_fragment>
	}`;
	return floor;
}
