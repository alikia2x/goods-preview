import type { MeshPhysicalMaterialParameters } from "three";

const base = {
	specularIntensity: 0.12,
	metalness: 0,
	ior: 1.48,
	exposure: 1,
};
// Surface finish only. The environment each preset renders under comes from the
// shared lighting registry, not from here.
export const FINISHES = Object.freeze({
	matte: Object.freeze({
		...base,
		label: "哑膜",
		defaultGloss: 30,
		roughness: 0.8,
	}),
	glossy: Object.freeze({
		...base,
		label: "亮膜",
		defaultGloss: 50,
		roughness: 0.65,
	}),
});
export type Finish = keyof typeof FINISHES;
export function finishMaterial(
	finish: Finish,
	gloss: number,
): MeshPhysicalMaterialParameters {
	const p = FINISHES[finish],
		amount = Math.min(100, Math.max(0, gloss)) / 100;
	return {
		roughness: p.roughness,
		specularIntensity: p.specularIntensity,
		metalness: 0,
		ior: p.ior,
		clearcoat: amount,
		clearcoatRoughness:
			finish === "glossy"
				? 0.022 + 0.28 * (1 - amount) ** 2
				: 0.6 - 0.32 * amount,
	};
}
