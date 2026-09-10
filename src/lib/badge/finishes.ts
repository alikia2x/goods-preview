import type { MeshPhysicalMaterialParameters } from "three";

const base = {
	specularIntensity: 0.12,
	metalness: 0,
	ior: 1.48,
	environmentFill: 0.62,
	exposure: 1,
	defaultGloss: 85,
};
export const FINISHES = Object.freeze({
	matte: Object.freeze({
		...base,
		label: "哑膜",
		roughness: 0.8,
		environmentWidth: 0.22,
		environmentPeak: 1.8,
	}),
	glossy: Object.freeze({
		...base,
		label: "亮膜",
		roughness: 0.65,
		environmentWidth: 0.012,
		environmentPeak: 33,
	}),
});
export type Finish = keyof typeof FINISHES;
export const KEY_DIRECTION = [-3, 4, 6] as const;
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
