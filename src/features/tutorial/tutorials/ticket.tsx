import type { ProductTutorial } from "@/features/tutorial/types";

export const ticketTutorial: ProductTutorial = {
	title: "镭射票",
	content: (
		<>
			<p>点击左上角的制品名称，可选择具体的工艺。</p>
			<p>对于「镭射覆膜」和「闪粉覆膜」工艺，会在制品表面附着对应的效果。</p>
			<p>
				「镭射银」工艺要求上传的图片包含透明部分。此时，对应的透明部分会呈现镭射效果。
			</p>
			<p>点击票面图像右下角的调整按钮，可以调整出血范围。</p>
		</>
	),
};
