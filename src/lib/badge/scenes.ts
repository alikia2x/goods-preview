export const SCENES = {
	plain: { label: "普通场景", background: "#e9e9e7", standing: false },
	table: { label: "日光台面", background: "#eff0ed", standing: true },
	studio: { label: "窗影影棚", background: "#e2e4e2", standing: true },
	standing: { label: "立放展示", background: "#dedfe0", standing: true },
	transparent: { label: "透明背景", background: "#e9e9e7", standing: false },
} as const;
export type SceneKind = keyof typeof SCENES;
