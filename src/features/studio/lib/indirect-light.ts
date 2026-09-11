import type * as THREE from "three";

// With explicit HDR emitters, retaining all diffuse IBL counts those emitters
// twice and illuminates the shadow from every direction. Keep specular IBL.
export function sampledDiffuseLighting(
	shader: THREE.WebGLProgramParametersWithUniforms,
) {
	shader.fragmentShader = shader.fragmentShader.replace(
		"#include <lights_fragment_maps>",
		`
  #if defined( RE_IndirectDiffuse )
   vec3 previousIrradiance = iblIrradiance;
  #endif
  #include <lights_fragment_maps>
  #if defined( RE_IndirectDiffuse )
   iblIrradiance = previousIrradiance + (iblIrradiance - previousIrradiance) * 0.2;
  #endif
 `,
	);
}
