// Scene presets are shared by the imperative badge and declarative keychain studios.
// "studio" (窗影影棚) is temporarily hidden from the picker — its window-caster
// staging needs further tuning before it earns a place next to the others.
export const SCENES = {
	plain: { label: "普通场景", background: "#e9e9e7", standing: false },
	table: { label: "日光台面", background: "#f3f3f1", standing: true },
	studio: { label: "窗影影棚", background: "#f0f1ef", standing: true },
	standing: { label: "立放展示", background: "#f1f1ef", standing: true },
	black: { label: "黑色反射台", background: "#08090b", standing: true },
	transparent: { label: "透明背景", background: "#e9e9e7", standing: false },
} as const;
export type SceneKind = keyof typeof SCENES;
export const HIDDEN_SCENES: ReadonlySet<SceneKind> = new Set(["studio"]);

export function sceneWallZ(kind: SceneKind): number | null {
	return kind === "standing" ? -0.65 : kind === "studio" ? -2 : null;
}
