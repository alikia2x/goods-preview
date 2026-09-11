import type * as THREE from "three";

// Keep the share of the environment the emitters do not re-deliver, and keep
// specular IBL: a product that reflects the whole capture while also being keyed
// by it is lit twice, and its shadow is filled from every direction. The share
// arrives as a uniform so a scene can keep its own split without a recompile.
export function sampledDiffuseLighting(
	shader: THREE.WebGLProgramParametersWithUniforms,
	ambientShare: { value: number },
) {
	shader.uniforms.ambientIblShare = ambientShare;
	shader.fragmentShader = shader.fragmentShader
		.replace("void main() {", "uniform float ambientIblShare; void main() {")
		.replace(
			"#include <lights_fragment_maps>",
			`
  #if defined( RE_IndirectDiffuse )
   vec3 previousIrradiance = iblIrradiance;
  #endif
  #include <lights_fragment_maps>
  #if defined( RE_IndirectDiffuse )
   iblIrradiance = previousIrradiance + (iblIrradiance - previousIrradiance) * ambientIblShare;
  #endif
 `,
		);
}
