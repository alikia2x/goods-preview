// What every workspace route is called in a browser tab and in a search result.
// The copy in index.html is the first paint and what a crawler reads before the
// bundle runs; this table is written back on every client-side navigation.
export type PageMetadata = { title: string; description: string };

const BADGE_PAGE: PageMetadata = {
	title: "覆膜吧唧 3D 预览 — Goods Preview",
	description:
		"上传图案，预览覆膜吧唧的立体效果：哑膜与亮膜、覆膜反光、出血范围、立放与平放姿态，并导出高分辨率 PNG。",
};

export const PAGE_METADATA: Record<string, PageMetadata> = {
	"/workspace/badge": BADGE_PAGE,
	"/workspace/ticket": {
		title: "镭射票 3D 预览 — Goods Preview",
		description:
			"上传图案，按长边设置镭射票尺寸，预览镭射覆膜、闪粉覆膜与透明图案镭射银并导出高清 PNG。",
	},
	"/workspace/keychain": {
		title: "亚克力钥匙扣 3D 预览 — Goods Preview",
		description:
			"上传图案自动生成切边，预览亚克力钥匙扣的板材厚度、透明留边、环形与龙虾扣五金及电镀色，并导出高分辨率 PNG。",
	},
	"/workspace/acrylic": {
		title: "任意亚克力 3D 预览 — Goods Preview",
		description:
			"上传图案自动生成切边，预览任意形状亚克力板材的长边尺寸、厚度、透明留边与表面反光，并导出高分辨率 PNG。",
	},
	"/workspace/standee": {
		title: "亚克力立牌 3D 预览 — Goods Preview",
		description:
			"上传图案自动生成切边并定制底座图案，预览亚克力立牌的底座直径、连接件尺寸与位置、板材厚度，并导出高分辨率 PNG。",
	},
};

// Anything unmatched is redirected to the badge, so its copy is the fallback.
export const DEFAULT_PAGE_METADATA: PageMetadata = BADGE_PAGE;

export function pageMetadata(pathname: string): PageMetadata {
	return PAGE_METADATA[pathname] ?? DEFAULT_PAGE_METADATA;
}
