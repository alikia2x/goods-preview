import { X } from "lucide-react";
import {
	type CSSProperties,
	type PointerEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { Button } from "@/components/ui/button";
import {
	trackHistoryDelete,
	trackHistoryOpen,
} from "@/features/analytics/events";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	deleteHistoryEntry,
	listHistoryEntries,
	type WorkspaceHistoryEntry,
} from "@/features/history/database";
import { useWorkspaceHistory } from "@/features/history/WorkspaceHistory";

type HistoryCardEntry = WorkspaceHistoryEntry & { thumbnailUrl: string };

const COARSE_POINTER_QUERY = "(pointer: coarse)";
const LONG_PRESS_DELAY = 550;
const MASONRY_GAP = 16;
const CARD_TEXT_HEIGHT = 24;

function subscribeToCoarsePointer(listener: () => void) {
	const media = window.matchMedia(COARSE_POINTER_QUERY);
	media.addEventListener("change", listener);
	return () => media.removeEventListener("change", listener);
}

function getCoarsePointerSnapshot() {
	return window.matchMedia(COARSE_POINTER_QUERY).matches;
}

function settingString(settings: Record<string, unknown>, key: string) {
	const value = settings[key];
	return typeof value === "string" ? value : "";
}

function settingNumber(settings: Record<string, unknown>, key: string) {
	const value = settings[key];
	return typeof value === "number" ? value : null;
}

function historyProductLabel(entry: WorkspaceHistoryEntry) {
	const size = settingNumber(entry.settings, "size");
	const sizeLabel = size === null ? "" : `${size} mm`;
	const detail = (() => {
		switch (entry.product) {
			case "badge":
				return settingString(entry.settings, "finish") === "matte"
					? "哑膜"
					: "亮膜";
			case "ticket": {
				const finish = settingString(entry.settings, "finish");
				return (
					{ laser: "镭射覆膜", glitter: "闪粉覆膜", silver: "镭射银" }[
						finish
					] ?? ""
				);
			}
			case "keychain": {
				const hardware =
					settingString(entry.settings, "hardware") === "clasp"
						? "龙虾扣"
						: "圆环";
				const color =
					settingString(entry.settings, "hardwareColor") === "gold"
						? "金色"
						: "银色";
				return `${hardware} · ${color}`;
			}
			default:
				return "";
		}
	})();
	const product =
		{
			badge: "覆膜吧唧",
			keychain: "亚克力钥匙扣",
			standee: "亚克力立牌",
			acrylic: "任意亚克力",
			ticket: "镭射票",
		}[entry.product] ?? "";
	return [product, detail, sizeLabel].filter(Boolean).join(" · ");
}

function historyDate(timestamp: number) {
	return new Intl.DateTimeFormat("zh-CN", {
		month: "numeric",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(timestamp);
}

function HistoryCard({
	entry,
	layout,
	onSelect,
	onDelete,
	onImageRatio,
}: {
	entry: HistoryCardEntry;
	layout: { width: number; x: number; y: number; ratio: number };
	onSelect: () => void;
	onDelete: () => void;
	onImageRatio: (id: number, ratio: number) => void;
}) {
	const pressTimerRef = useRef<number | null>(null);
	const ignoreClickRef = useRef(false);
	const cancelPress = useCallback(() => {
		if (pressTimerRef.current !== null) {
			window.clearTimeout(pressTimerRef.current);
			pressTimerRef.current = null;
		}
	}, []);
	const beginPress = useCallback(
		(event: PointerEvent<HTMLButtonElement>) => {
			if (event.pointerType === "mouse") return;
			cancelPress();
			pressTimerRef.current = window.setTimeout(() => {
				pressTimerRef.current = null;
				ignoreClickRef.current = true;
				onDelete();
			}, LONG_PRESS_DELAY);
		},
		[cancelPress, onDelete],
	);

	useEffect(() => cancelPress, [cancelPress]);
	return (
		<Button
			variant="ghost"
			className="absolute flex h-auto flex-col items-stretch gap-2 rounded-none border-0 bg-transparent p-0 text-left hover:bg-transparent hover:text-white [-webkit-touch-callout:none]"
			style={
				{
					width: layout.width,
					transform: `translate3d(${layout.x}px, ${layout.y}px, 0)`,
				} satisfies CSSProperties
			}
			onPointerDown={beginPress}
			onPointerUp={cancelPress}
			onPointerCancel={cancelPress}
			onPointerLeave={cancelPress}
			onContextMenu={(event) => {
				// Long press raises the native menu on some browsers even though the
				// card owns the gesture; suppress it and keep the timer from firing twice.
				event.preventDefault();
				cancelPress();
				onDelete();
			}}
			onDragStart={(event) => event.preventDefault()}
			onClick={() => {
				if (ignoreClickRef.current) {
					ignoreClickRef.current = false;
					return;
				}
				onSelect();
			}}
		>
			<span
				className="block w-full overflow-hidden rounded-xl bg-white/6"
				style={{ aspectRatio: layout.ratio }}
			>
				<img
					src={entry.thumbnailUrl}
					alt=""
					draggable={false}
					className="size-full object-cover transition-opacity [-webkit-touch-callout:none] group-hover/button:opacity-85"
					onLoad={(event) => {
						const { naturalHeight, naturalWidth } = event.currentTarget;
						if (!naturalHeight || !naturalWidth) return;
						const ratio = Math.min(
							16 / 9,
							Math.max(9 / 16, naturalWidth / naturalHeight),
						);
						if (entry.id !== undefined) onImageRatio(entry.id, ratio);
					}}
				/>
			</span>
			<span className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2 text-xs text-panel-dim">
				<span className="truncate">{historyProductLabel(entry)}</span>
				<span className="whitespace-nowrap">
					{historyDate(entry.updatedAt)}
				</span>
			</span>
		</Button>
	);
}

export function HistoryDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [entries, setEntries] = useState<HistoryCardEntry[]>([]);
	const [entryToDelete, setEntryToDelete] = useState<HistoryCardEntry | null>(
		null,
	);
	const [imageRatios, setImageRatios] = useState<Record<number, number>>({});
	const [masonryWidth, setMasonryWidth] = useState(0);
	const [masonryElement, setMasonryElement] = useState<HTMLDivElement | null>(
		null,
	);
	const { restoreHistoryEntry } = useWorkspaceHistory();
	const coarsePointer = useSyncExternalStore(
		subscribeToCoarsePointer,
		getCoarsePointerSnapshot,
		() => false,
	);
	const description =
		"此处可查看过去30条历史记录。点击可从记录中恢复，" +
		(coarsePointer ? "长按" : "右键") +
		"可删除。";
	const removeEntry = useCallback(async () => {
		const entry = entryToDelete;
		if (entry?.id === undefined) return;
		await deleteHistoryEntry(entry.id);
		trackHistoryDelete(entry.product);
		setEntries((current) => {
			const removed = current.find((item) => item.id === entry.id);
			if (removed) URL.revokeObjectURL(removed.thumbnailUrl);
			return current.filter((item) => item.id !== entry.id);
		});
		setEntryToDelete(null);
	}, [entryToDelete]);
	const onImageRatio = useCallback((id: number, ratio: number) => {
		setImageRatios((current) => {
			if (Math.abs((current[id] ?? 1) - ratio) < 0.001) return current;
			return { ...current, [id]: ratio };
		});
	}, []);
	const masonry = useMemo(() => {
		if (!masonryWidth) return { height: 0, items: new Map<number, never>() };
		const columns = masonryWidth >= 800 ? 4 : masonryWidth >= 560 ? 3 : 2;
		const width = (masonryWidth - MASONRY_GAP * (columns - 1)) / columns;
		const columnHeights = Array.from({ length: columns }, () => 0);
		const items = new Map<
			number,
			{ width: number; x: number; y: number; ratio: number }
		>();
		for (const entry of entries) {
			if (entry.id === undefined) continue;
			let column = 0;
			for (let index = 1; index < columns; index++) {
				if (columnHeights[index] < columnHeights[column]) column = index;
			}
			const ratio = imageRatios[entry.id] ?? 1;
			items.set(entry.id, {
				width,
				x: column * (width + MASONRY_GAP),
				y: columnHeights[column],
				ratio,
			});
			columnHeights[column] += width / ratio + CARD_TEXT_HEIGHT + MASONRY_GAP;
		}
		return {
			height: entries.length ? Math.max(...columnHeights) - MASONRY_GAP : 0,
			items,
		};
	}, [entries, imageRatios, masonryWidth]);

	useEffect(() => {
		if (!masonryElement) return;
		const updateWidth = () => setMasonryWidth(masonryElement.clientWidth);
		updateWidth();
		const observer = new ResizeObserver(updateWidth);
		observer.observe(masonryElement);
		return () => observer.disconnect();
	}, [masonryElement]);

	useEffect(() => {
		if (!open) return;
		let active = true;
		const urls: string[] = [];
		void listHistoryEntries().then((next) => {
			const entriesWithThumbnails = next.map((entry) => {
				const thumbnailUrl = URL.createObjectURL(entry.artwork);
				urls.push(thumbnailUrl);
				return { ...entry, thumbnailUrl };
			});
			if (active) {
				trackHistoryOpen(entriesWithThumbnails.length);
				setEntries(entriesWithThumbnails);
			} else
				urls.forEach((url) => {
					URL.revokeObjectURL(url);
				});
		});
		return () => {
			active = false;
			urls.forEach((url) => {
				URL.revokeObjectURL(url);
			});
		};
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="grid h-[min(42rem,calc(100dvh-2rem))] grid-rows-[auto_minmax(0,1fr)] gap-5 overflow-hidden rounded-3xl bg-panel p-6 text-panel-foreground shadow-[0_24px_80px_#00000040] sm:max-w-2xl lg:max-w-4xl"
			>
				<DialogHeader className="flex-row items-center justify-between gap-4">
					<div className="grid gap-1">
						<DialogTitle className="text-xl font-semibold text-white">
							历史记录
						</DialogTitle>
						<DialogDescription className="text-xs leading-5 text-panel-dim">
							{description}
						</DialogDescription>
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						className="shrink-0 rounded-full text-panel-dim hover:bg-white/10 hover:text-white"
						onClick={() => onOpenChange(false)}
						aria-label="关闭历史记录"
					>
						<X />
					</Button>
				</DialogHeader>
				<div className="scrollbar-hidden min-h-0 overflow-y-auto overscroll-contain">
					{entries.length ? (
						<div
							ref={setMasonryElement}
							className="relative w-full"
							style={{ height: masonry.height }}
						>
							{entries.map((entry) => {
								if (entry.id === undefined) return null;
								const layout = masonry.items.get(entry.id);
								if (!layout) return null;
								return (
									<HistoryCard
										key={entry.id}
										entry={entry}
										layout={layout}
										onSelect={() => {
											restoreHistoryEntry(entry);
											onOpenChange(false);
										}}
										onDelete={() => setEntryToDelete(entry)}
										onImageRatio={onImageRatio}
									/>
								);
							})}
						</div>
					) : (
						<p className="py-8 text-center text-sm text-panel-dim">暂无记录</p>
					)}
				</div>
			</DialogContent>
			<Dialog
				open={entryToDelete !== null}
				onOpenChange={(nextOpen) => {
					if (!nextOpen) setEntryToDelete(null);
				}}
			>
				<DialogContent
					showCloseButton={false}
					className="gap-5 rounded-3xl bg-panel p-6 text-panel-foreground
				 	shadow-[0_24px_80px_#00000040]"
				>
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold text-white">
							删除记录
						</DialogTitle>
						<DialogDescription className="text-sm leading-6 text-panel-dim">
							删除后无法恢复。
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2">
						<Button variant="ghost" onClick={() => setEntryToDelete(null)}>
							取消
						</Button>
						<Button variant="destructive" onClick={() => void removeEntry()}>
							删除
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
}
