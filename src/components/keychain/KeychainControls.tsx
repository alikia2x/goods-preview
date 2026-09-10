import { ChevronUp, Plus } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AdjustmentPanel } from "@/components/workspace/AdjustmentPanel";
import { LightDirectionControls } from "@/components/workspace/LightDirectionControls";
import { LightingControls } from "@/components/workspace/LightingControls";
import { RangeControl } from "@/components/workspace/RangeControl";
import { SceneControls } from "@/components/workspace/SceneControls";
import type { useKeychainWorkspace } from "@/hooks/useKeychainWorkspace";

type Workspace = ReturnType<typeof useKeychainWorkspace>;

export function KeychainSize({ workspace }: { workspace: Workspace }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="pill">
					<ChevronUp />
					{workspace.settings.size} mm
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end">
				<RangeControl
					label="图案长边"
					value={workspace.settings.size}
					min={40}
					max={80}
					display={`${workspace.settings.size} mm`}
					onChange={(value) => workspace.change("size", value)}
				/>
			</PopoverContent>
		</Popover>
	);
}

export function KeychainControls({ workspace: w }: { workspace: Workspace }) {
	const input = useRef<HTMLInputElement>(null);
	return (
		<AdjustmentPanel
			label="调整钥匙扣"
			ready={w.ready && !w.loading && !!w.model}
			busy={w.busy}
			error={w.error}
			resolution={w.resolution}
			onResolutionChange={w.setResolution}
			onExport={w.exportArtwork}
		>
			<section className="control-section">
				<h2>图像</h2>
				<div className="image-row">
					<Button
						variant="ghost"
						className="art-thumbnail"
						aria-label="更换图案"
						onClick={() => input.current?.click()}
					>
						{w.model && <img src={w.model.artwork.thumbnail} alt="印刷图案" />}
					</Button>
					<Button
						variant="ghost"
						className="upload-button"
						aria-label="上传图案"
						onClick={() => input.current?.click()}
					>
						<Plus />
					</Button>
				</div>
				<input
					hidden
					ref={input}
					type="file"
					accept="image/png,image/jpeg,image/webp"
					onChange={(event) => {
						void w.upload(event.target.files?.[0]);
						event.target.value = "";
					}}
				/>
				<p className="file-status" role="status">
					<span title={w.model?.artwork.name}>
						{w.loading ? "正在生成切边…" : w.model?.artwork.name}
					</span>
				</p>
			</section>
			<section className="control-section">
				<h2>亚克力</h2>
				<RangeControl
					label="厚度"
					value={w.settings.thickness}
					min={2}
					max={5}
					step={0.5}
					display={`${w.settings.thickness} mm`}
					onChange={(value) => w.change("thickness", value)}
				/>
				<RangeControl
					label="透明留边"
					value={w.settings.border}
					min={1}
					max={5}
					step={0.5}
					display={`${w.settings.border} mm`}
					onChange={(value) => w.change("border", value)}
				/>
			</section>
			<section className="control-section">
				<h2>连接件</h2>
				<Select
					value={w.settings.hardware}
					onValueChange={(value) =>
						w.change("hardware", value as "ring" | "clasp")
					}
				>
					<SelectTrigger className="scene-select" aria-label="连接件">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ring">圆环 · 短链</SelectItem>
						<SelectItem value="clasp">龙虾扣 · 短链</SelectItem>
					</SelectContent>
				</Select>
			</section>
			<SceneControls
				value={w.settings.scene}
				onChange={(value) => w.change("scene", value)}
			/>
			<LightingControls
				value={w.settings.lighting}
				onChange={(value) => w.change("lighting", value)}
			/>
			<LightDirectionControls settings={w.settings} onChange={w.change} />
			<RangeControl
				label="光照强度"
				value={w.settings.light}
				onChange={(value) => w.change("light", value)}
			/>
			<RangeControl
				label="表面反光"
				value={w.settings.gloss}
				onChange={(value) => w.change("gloss", value)}
			/>
			<RangeControl
				label="阴影强度"
				value={w.settings.shadow}
				onChange={(value) => w.change("shadow", value)}
			/>
		</AdjustmentPanel>
	);
}
