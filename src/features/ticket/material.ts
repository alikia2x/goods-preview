import * as THREE from "three";
import type { TicketSettings } from "@/features/ticket/settings";

// Coating contributions use the actual light rig and the camera of each render
// pass, including the mirrored camera. The printed surface normal stays intact.
export function ticketMaterial(
	map: THREE.Texture,
	finish: TicketSettings["finish"],
	settings: TicketSettings,
) {
	const { gloss } = settings;
	const silver = finish === "silver";
	const material = new THREE.MeshPhysicalMaterial({
		map,
		roughness: 0.52,
		metalness: 0,
		clearcoat: (gloss / 100) * 0.35,
		clearcoatRoughness: 0.22,
		specularIntensity: 0.35,
	});
	material.onBeforeCompile = (shader) => {
		shader.uniforms.ticketStrength = { value: gloss / 100 };
		for (const key of [
			"foilScale",
			"foilThreshold",
			"foilBrightness",
			"foilDistortion",
			"foilMotion",
			"foilSpectrum",
			"glitterDensity",
			"glitterSize",
			"glitterSharpness",
			"glitterMotion",
		] as const) {
			shader.uniforms[key] = { value: settings[key] };
		}
		const varyings = `varying vec3 ticketTangent; varying vec3 ticketBitangent;`;
		shader.vertexShader = shader.vertexShader
			.replace("#include <common>", `#include <common>\n${varyings}`)
			.replace(
				"#include <defaultnormal_vertex>",
				`#include <defaultnormal_vertex>
 ticketTangent = normalize(mat3(modelViewMatrix) * vec3(1.0, 0.0, 0.0));
 ticketBitangent = normalize(mat3(modelViewMatrix) * vec3(0.0, 1.0, 0.0));`,
			);
		shader.fragmentShader = shader.fragmentShader.replace(
			"#include <common>",
			`#include <common>
${varyings}
uniform float ticketStrength;
uniform float foilScale, foilThreshold, foilBrightness, foilDistortion, foilMotion, foilSpectrum;
uniform float glitterDensity, glitterSize, glitterSharpness, glitterMotion;
float ticketHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// Smooth, sheet-anchored variations in the embossed foil. Coarse structure
// bends the diffraction field; fine structure breaks up the polished highlight.
float ticketNoise(vec2 p) {
 vec2 cell = floor(p), f = fract(p);
 f = f * f * (3.0 - 2.0 * f);
 return mix(mix(ticketHash(cell), ticketHash(cell + vec2(1.0, 0.0)), f.x),
            mix(ticketHash(cell + vec2(0.0, 1.0)), ticketHash(cell + vec2(1.0)), f.x), f.y);
}
vec3 ticketSpectrum(float phase) {
 vec3 wave = 0.5 + 0.5 * cos(phase + vec3(0.0, -2.094395, 2.094395));
 return mix(vec3(0.08), pow(clamp(wave, 0.0, 1.0), vec3(1.7)), 0.92);
}
`,
		);
		// Read original alpha before replacing it: the physical ticket is opaque,
		// while alpha controls ink coverage, never transparency of the whole sheet.
		shader.fragmentShader = shader.fragmentShader.replace(
			"#include <map_fragment>",
			`#include <map_fragment>
float ticketInk = sampledDiffuseColor.a;
diffuseColor.rgb = mix(vec3(${silver ? "0.72" : "1.0"}), sampledDiffuseColor.rgb, ticketInk);
diffuseColor.a = 1.0;
`,
		);
		if (silver)
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <lights_physical_fragment>",
				`#include <lights_physical_fragment>
vec2 silverUv = (vMapUv - 0.5) * vec2(textureSize(map, 0)) / float(max(textureSize(map, 0).x, textureSize(map, 0).y));
vec2 silverAngle = vec2(ticketTangent.z, ticketBitangent.z);
vec2 silverDomain = silverUv * 1.8 + silverAngle * 1.25;
float silverField = ticketNoise(silverDomain + 13.7);
float silverPhase = silverField * 9.0 + dot(silverAngle, vec2(6.0, 4.0));
float silverColorAmount = smoothstep(-0.35, 0.55, sin(dot(silverAngle, vec2(5.5, 3.0)) + silverField * 1.8));
vec3 silverTint = mix(vec3(0.85), ticketSpectrum(silverPhase), silverColorAmount * 0.92);
material.diffuseColor *= ticketInk;
material.specularColor = mix(silverTint, material.specularColor, ticketInk);
material.roughness = mix(0.26, material.roughness, ticketInk);
`,
			);
		const glitter = `
vec2 imageSize = vec2(textureSize(map, 0));
vec2 grid = vMapUv * imageSize / max(imageSize.x, imageSize.y) * mix(80.0, 290.0, glitterDensity / 100.0);
vec2 cell = floor(grid);
vec2 seed = vec2(ticketHash(cell), ticketHash(cell + 71.3));
vec2 offset = fract(grid) - (0.22 + seed * 0.56);
float radius = mix(0.065, 0.14, ticketHash(cell + 13.0)) * mix(0.4, 1.6, glitterSize / 100.0);
// A filtered Gaussian conserves tiny highlights' energy in the reflection and
// exports, instead of expanding every subpixel dot into a bright square.
float footprint = max(dot(dFdx(grid), dFdx(grid)), dot(dFdy(grid), dFdy(grid)));
float variance = radius * radius + footprint * 0.16;
float dotMask = exp(-dot(offset, offset) / max(variance, 0.0001)) * radius * radius / variance;
dotMask *= step(0.28, ticketHash(cell + 39.0)) * (1.0 - smoothstep(0.5, 2.0, footprint));
vec3 facet = normalize(normal + normalize(ticketTangent) * (seed.x - 0.5) * 1.5 + normalize(ticketBitangent) * (seed.y - 0.5) * 1.5);
float sparkle = 0.0;
#if NUM_DIR_LIGHTS > 0
for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
 vec3 L = directionalLights[i].direction;
 vec3 H = normalize(L + geometryViewDir);
 float energy = dot(directionalLights[i].color, vec3(0.2126, 0.7152, 0.0722));
 // Each fixed facet has a narrow angular acceptance. There is no constant
 // brightness term: a missed reflection disappears back into the artwork.
 float alignment = clamp(dot(facet, H), 0.0, 1.0);
 vec2 angular = vec2(dot(H, normalize(ticketTangent)), dot(H, normalize(ticketBitangent)));
 float phase = dot(angular, normalize(seed - 0.5 + vec2(0.001))) * (8.0 + glitterMotion * 0.65) + seed.y * 6.283185;
 float pulse = pow(max(0.0, sin(phase)), mix(4.0, 20.0, glitterSharpness / 100.0));
 float glint = pow(alignment, 120.0) * pulse;
 sparkle += energy * max(dot(normal, L), 0.0) * 85.0 * glint;
}
#endif
outgoingLight += vec3(dotMask * sparkle * ticketStrength * 2.8);
`;
		const laser = `
vec2 foilImageSize = vec2(textureSize(map, 0));
vec2 foilUv = (vMapUv - 0.5) * foilImageSize / max(foilImageSize.x, foilImageSize.y);
// Select the strongest emitter so fill lights cannot paint overlapping colour
// across the whole ticket. Fill lighting still illuminates the printed artwork.
vec3 foilDirection = vec3(0.0, 0.0, 1.0);
float foilEnergy = 0.0;
#if NUM_DIR_LIGHTS > 0
for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
 float energy = dot(directionalLights[i].color, vec3(0.2126, 0.7152, 0.0722));
 if (energy > foilEnergy) { foilEnergy = energy; foilDirection = directionalLights[i].direction; }
}
#endif
// Treat the camera as a single viewing direction across the sheet. Using the
// per-fragment perspective ray here makes its angular spread change when the
// camera dollies, which incorrectly stretches the foil field while zooming.
vec3 foilViewDirection = vec3(0.0, 0.0, 1.0);
vec3 foilHalf = normalize(foilDirection + foilViewDirection + vec3(0.0, 0.0, 0.00001));
vec2 slope = vec2(dot(foilHalf, normalize(ticketTangent)), dot(foilHalf, normalize(ticketBitangent)));
// Continuous domain-warped noise: there are no seeded spot centres or
// enumerated regions. Connected bright areas emerge from a thresholded field.
vec2 motion = slope * mix(0.2, 3.5, foilMotion / 100.0);
float frequency = mix(2.0, 14.0, foilScale / 100.0);
vec2 fieldUv = (foilUv + motion) * frequency;
vec2 warp = vec2(ticketNoise(fieldUv * 0.63 + 7.1), ticketNoise(fieldUv * 0.71 + 31.9)) - 0.5;
vec2 domain = fieldUv + warp * mix(0.0, 3.0, foilDistortion / 100.0);
float coarse = ticketNoise(domain);
float detail = ticketNoise(domain * 2.13 + 17.4);
float field = coarse * 0.78 + detail * 0.22;
// A higher threshold exposes only the peaks. It changes coverage without
// imposing a count; areas split, merge and disappear as the view moves.
float threshold = mix(0.38, 0.86, foilThreshold / 100.0);
float filterWidth = max(fwidth(field), 0.015);
float envelope = smoothstep(threshold - filterWidth, threshold + 0.13 + filterWidth, field);
float phaseField = ticketNoise(domain * 0.57 + 48.3);
float phase = (phaseField * 2.0 + field) * mix(3.0, 14.0, foilSpectrum / 100.0) + dot(slope, vec2(7.0, 4.0));
float grainFootprint = max(length(dFdx(foilUv)), length(dFdy(foilUv))) * 550.0;
float grain = mix(ticketNoise(foilUv * vec2(550.0, 220.0)), 0.5, smoothstep(0.35, 1.4, grainFootprint));
vec3 foilLight = ticketSpectrum(phase) * mix(0.65, 1.6, grain);
foilLight += vec3(envelope * envelope * grain * grain * 0.18);
float incidence = max(dot(normal, foilDirection), 0.0);
float exposed = ${silver ? "(1.0 - ticketInk)" : "1.0"};
float reflection = envelope * incidence * foilEnergy * ticketStrength * exposed;
outgoingLight += foilLight * reflection * (foilBrightness / 100.0) * ${silver ? "34.0" : "25.0"};

`;
		const silverReflection = `
// Broad substrate reflection, independent of the laminate threshold and scale.
// Alpha masks all of it, so opaque ink never receives the silver effect.
vec3 silverReflected = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
outgoingLight += silverReflected * (1.0 - ticketInk) * ticketStrength * 2.5;
`;
		shader.fragmentShader = shader.fragmentShader.replace(
			"#include <opaque_fragment>",
			`${finish === "glitter" ? glitter : silver ? silverReflection : laser}\n#include <opaque_fragment>`,
		);
	};
	material.customProgramCacheKey = () => `ticket-v8-${finish}`;
	return material;
}
