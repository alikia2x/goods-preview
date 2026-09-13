import type { ProductTutorial } from "@/features/tutorial/types";

export const keychainTutorial: ProductTutorial = {
	title: "亚克力钥匙扣",
	content: (
		<>
			<p>在调整面板中上传图案，切边会沿图案的不透明区域自动生成。</p>
			<p>可以根据情况调整透明边的宽度。</p>
			<p><b>注意</b>：钥匙链的质感严重依赖于真实的光照环境。
			因此在调整面板的「光照环境」中，「实景」开头的选项才能达到合适的效果。</p>
		</>
	),
};
