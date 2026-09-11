import * as THREE from "three";

// Shadow maps cannot refract rays. Stochastic coverage approximates the energy
// reflected at both PMMA interfaces, preserving clear centres and grazing rims.
export function createOpticalShadow() {
	const material = new THREE.MeshDepthMaterial({
		depthPacking: THREE.RGBADepthPacking,
	});
	material.onBeforeCompile = (shader) => {
		shader.vertexShader = shader.vertexShader.replace(
			"void main() {",
			"varying vec3 opticalNormal; void main() { opticalNormal = normalize(normalMatrix * normal);",
		);
		shader.fragmentShader = shader.fragmentShader
			.replace("void main() {", "varying vec3 opticalNormal; void main() {")
			.replace(
				"#include <alphahash_fragment>",
				`
   float cosine = abs(normalize(opticalNormal).z);
   float fresnel = 0.039 + 0.961 * pow(1.0 - cosine, 5.0);
   float coverage = 1.0 - pow(1.0 - fresnel, 2.0);
   float noise = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
   if (noise > coverage) discard;
  `,
			);
	};
	material.customProgramCacheKey = () => "pmma-optical-shadow-v1";
	return material;
}
