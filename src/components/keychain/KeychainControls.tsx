import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { AdjustmentPanel } from "@/components/workspace/AdjustmentPanel";
import { LightDirectionControls } from "@/components/workspace/LightDirectionControls";
import { LightingControls } from "@/components/workspace/LightingControls";
import { RangeControl } from "@/components/workspace/RangeControl";
import { SceneControls } from "@/components/workspace/SceneControls";
import type { useKeychainWorkspace } from "@/hooks/useKeychainWorkspace";
import controlStyles from "@/styles/studio-controls.module.css";

type Workspace = ReturnType<typeof useKeychainWorkspace>;

export function KeychainSize({
	workspace,
	arrow = "up",
}: {
	workspace: Workspace;
	arrow?: "up" | "down";
}) {
	const Arrow = arrow === "down" ? ChevronDown : ChevronUp;
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					className="inline-flex h-[46px] items-center justify-center gap-[9px] !rounded-full !bg-[#292929] px-[22px] text-sm font-[550] whitespace-nowrap !text-[#fafafa] shadow-[0_5px_15px_#00000015] hover:!bg-[#3b3b3b] tabular-nums max-[700px]:h-11 max-[700px]:gap-1 max-[700px]:px-3 max-[700px]:text-[11px]"
				>
					<Arrow />
					{workspace.settings.size} mm
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className={`${controlStyles.popoverContent} max-[700px]:select-none`}
			>
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
			transparentBackground={w.settings.transparentBackground}
			onResolutionChange={w.setResolution}
			onTransparentBackgroundChange={(value) =>
				w.change("transparentBackground", value)
			}
			onExport={w.exportArtwork}
		>
			<section className="mb-8 [&_h2]:mb-3 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-[#dedede] max-[700px]:mb-4 max-[700px]:[&_h2]:mb-2">
				<h2>图像</h2>
				<div className="flex gap-4">
					<Button
						variant="ghost"
						className="relative h-[100px] w-[100px] overflow-hidden !rounded-[10px] !bg-[#888] p-0 max-[700px]:!size-20 [&_img]:size-full [&_img]:object-cover"
						aria-label="更换图案"
						onClick={() => input.current?.click()}
					>
						{w.model && <img src={w.model.artwork.thumbnail} alt="印刷图案" />}
					</Button>
					<Button
						variant="ghost"
						className="relative h-[100px] w-[100px] overflow-hidden !rounded-[10px] !border-0 !bg-[#888] p-0 !text-[#e5e5e5] hover:!bg-[#505050] max-[700px]:!size-20 [&_svg]:size-[25px]"
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
				<p
					className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#aaa] [&_svg]:size-3 [&_span]:max-w-[240px] [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap"
					role="status"
				>
					<span title={w.model?.artwork.name}>
						{w.loading ? "正在生成切边…" : w.model?.artwork.name}
					</span>
				</p>
			</section>
			<section className="mb-8 [&_h2]:mb-3 [&_h2]:text-sm [&_h2]:font-medium [&_h2]:text-[#dedede] max-[700px]:mb-4 max-[700px]:[&_h2]:mb-2">
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
