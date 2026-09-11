import { Plus } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";

// The artwork picker both products share: thumbnail, upload tile, hidden file
// input and a status row. Products vary only the labels, the status content and
// an optional overlay on the thumbnail (the badge's bleed popover).
export function ArtworkUploadSection({
	thumbnail,
	name,
	status,
	overlay,
	changeLabel,
	uploadLabel,
	onUpload,
}: {
	thumbnail: string;
	name: string;
	status: ReactNode;
	overlay?: ReactNode;
	changeLabel: string;
	uploadLabel: string;
	onUpload: (file?: File) => void;
}) {
	const input = useRef<HTMLInputElement>(null);
	return (
		<AdjustmentSection title="图像">
			<div className="flex gap-4">
				<div className="relative h-[100px] w-[100px] max-mobile:size-20">
					<Button
						variant="ghost"
						className="relative h-[100px] w-[100px] overflow-hidden rounded-[10px]! bg-placeholder! p-0 max-mobile:size-20! [&_img]:size-full [&_img]:object-cover"
						aria-label={changeLabel}
						onClick={() => input.current?.click()}
					>
						{thumbnail && <img src={thumbnail} alt={name} />}
					</Button>
					{overlay}
				</div>
				<Button
					variant="ghost"
					className="relative h-[100px] w-[100px] overflow-hidden rounded-[10px]! border-0! bg-placeholder! p-0 text-placeholder-foreground! hover:bg-panel-soft! max-mobile:size-20! [&_svg]:size-[25px]"
					aria-label={uploadLabel}
					onClick={() => input.current?.click()}
				>
					<Plus />
				</Button>
				<input
					ref={input}
					type="file"
					hidden
					accept="image/png,image/jpeg,image/webp"
					onChange={(event) => {
						const file = event.target.files?.[0];
						event.currentTarget.value = "";
						onUpload(file);
					}}
				/>
			</div>
			<div
				className="mt-2.5 flex items-center gap-1.5 text-[11px] text-panel-subtle [&_svg]:size-3 [&_span]:max-w-[240px] [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap"
				role="status"
			>
				{status}
			</div>
		</AdjustmentSection>
	);
}
