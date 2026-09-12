// The set every workspace can place a product on. A scene owns its backdrop
// colour, the shade of the wall that rises from the floor, how far back that
// wall stands, and whether the product is seated on the floor or stays flat.
// "studio" (窗影影棚) is temporarily hidden from the picker — its window-caster
// staging needs further tuning before it earns a place next to the others.
export const SCENES = {
	table: { label: "平坦台面", background: "#f3f3f1", standing: true },
	studio: { label: "窗影影棚", background: "#f0f1ef", standing: true },
	standing: { label: "立放展示", background: "#f1f1ef", standing: true },
	black: { label: "黑色反射台", background: "#08090b", standing: true },
} as const;
export type SceneKind = keyof typeof SCENES;
export const SCENE_KINDS = Object.keys(SCENES) as SceneKind[];

export function isSceneKind(value: string): value is SceneKind {
	return value in SCENES;
}

export const HIDDEN_SCENES: ReadonlySet<SceneKind> = new Set(["studio"]);

export function sceneWallZ(kind: SceneKind): number | null {
	return kind === "standing" ? -2.2 : kind === "studio" ? -2 : null;
}

// The backdrop is one plane rising from another, so the wall carries a shade of
// its own: the seam stays legible instead of the set reading as a single sheet.
export function sceneWallBackground(kind: SceneKind): string | null {
	return kind === "standing" ? "#e7e7e5" : null;
}
