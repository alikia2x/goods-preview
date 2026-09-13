import type { ReactNode } from "react";
import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";
import { ArtworkUploadSection } from "@/components/workspace/ArtworkUploadSection";
import { RangeControl } from "@/components/workspace/RangeControl";
import { StudioControls } from "@/components/workspace/StudioControls";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import type { AcrylicSheetSettings } from "@/features/acrylic/settings";
import type { ProductKind } from "@/tuning";

// What every acrylic product configures: the artwork, the sheet it is cut from,
// and the shared studio. Settings come from WorkspaceContext; only the artwork
// metadata is passed in.
export function AcrylicSheetControls({
	thumbnail,
	name,
	loading,
	onUpload,
	poseControls,
	product
}: {
	thumbnail: string;
	name: string;
	loading: boolean;
	product: ProductKind;
	onUpload: (file?: File) => Promise<void>;
	/** The pose section, supplied only by products that expose one. */
	poseControls?: ReactNode;
}) {
	const { settings, updateSetting } = useWorkspace<AcrylicSheetSettings>();
	return (
		<>
			<ArtworkUploadSection
				thumbnail={thumbnail}
				name={name}
				changeLabel="更换图案"
				uploadLabel="上传图案"
				onUpload={(file) => void onUpload(file)}
				status={<span title={name}>{loading ? "正在生成切边…" : name}</span>}
			/>
			{poseControls}
			<AdjustmentSection title="亚克力">
				<RangeControl
					label="厚度"
					value={settings.thickness}
					min={1}
					max={product === "acrylic" ? 25 : 8}
					step={0.5}
					display={`${settings.thickness} mm`}
					onChange={(value) => updateSetting("thickness", value)}
				/>
				<RangeControl
					label="透明留边"
					value={settings.border}
					min={1}
					max={10}
					step={0.5}
					display={`${settings.border} mm`}
					onChange={(value) => updateSetting("border", value)}
				/>
			</AdjustmentSection>
			<StudioControls glossLabel="反光强度" />
		</>
	);
}
