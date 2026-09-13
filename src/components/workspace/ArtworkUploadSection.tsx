import { Plus } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Button } from "@/components/ui/button";
import { AdjustmentSection } from "@/components/workspace/AdjustmentSection";

// One tile per image a product prints. Which images those are is the product's
// business: a label says what an image feeds, and the row scrolls sideways when
// the panel is too narrow to hold every tile at once.
export type UploadItem = {
	/** The current image's preview, or an empty string to show the upload tile. */
	thumbnail: string;
	/** Identifies the image in the row, below its tile. */
	label: string;
	/** Names the image for assistive technology. */
	ariaLabel: string;
	onUpload: (file: File) => void;
	/** Rendered over the thumbnail, for controls that adjust that image. */
	overlay?: ReactNode;
};

function UploadTile({ item }: { item: UploadItem }) {
	const input = useRef<HTMLInputElement>(null);
	return (
		<div className="flex w-25 shrink-0 flex-col gap-2 max-mobile:w-20">
			<div className="relative h-25 w-25 max-mobile:size-20">
				<Button
					variant="ghost"
					className="relative h-25 w-25 overflow-hidden rounded-[10px]! bg-placeholder! p-0 max-mobile:size-20! [&_img]:size-full [&_img]:object-contain"
					aria-label={item.ariaLabel}
					onClick={() => input.current?.click()}
				>
					{item.thumbnail ? (
						<img src={item.thumbnail} alt={item.label} />
					) : (
						<Plus className="size-6.25 text-placeholder-foreground" />
					)}
				</Button>
				{item.overlay}
				<input
					ref={input}
					type="file"
					hidden
					accept="image/png,image/jpeg,image/webp"
					onChange={(event) => {
						const file = event.target.files?.[0];
						event.currentTarget.value = "";
						if (file) item.onUpload(file);
					}}
				/>
			</div>
			<span className="text-[11px] text-panel-subtle">{item.label}</span>
		</div>
	);
}

export function ArtworkUploadSection({
	items,
	status,
}: {
	items: UploadItem[];
	status?: ReactNode;
}) {
	return (
		<AdjustmentSection title="图像">
			<div className="-mx-2 flex gap-4 overflow-x-auto px-2 pb-1">
				{items.map((item) => (
					<UploadTile item={item} key={item.label} />
				))}
			</div>
			{status && (
				<div
					className="mt-2.5 flex items-center gap-1.5 text-[11px] text-panel-subtle [&_svg]:size-3、
					 [&_span]:max-w-60 [&_span]:overflow-hidden [&_span]:text-ellipsis [&_span]:whitespace-nowrap"
					role="status"
				>
					{status}
				</div>
			)}
		</AdjustmentSection>
	);
}
