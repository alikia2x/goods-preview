import type * as THREE from "three";

// An opaque shadow catcher retains the chosen background colour and remains
// visible to transmission. It does not acquire diffuse lighting or highlights.
export function neutralFloor(shader: THREE.WebGLProgramParametersWithUniforms) {
	shader.fragmentShader = shader.fragmentShader.replace(
		"gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );",
		"gl_FragColor = vec4( color * mix( 1.0, getShadowMask(), opacity ), 1.0 );",
	);
}
