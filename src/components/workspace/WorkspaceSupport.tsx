import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	useSyncExternalStore,
} from "react";
import { tv } from "tailwind-variants";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { PRODUCT_VERSION } from "@/features/badge/constants";

const TUTORIAL_STORAGE_KEY = "goods-preview.tutorial-seen";
const COARSE_POINTER_QUERY = "(pointer: coarse)";

function subscribeToCoarsePointer(listener: () => void) {
	const media = window.matchMedia(COARSE_POINTER_QUERY);
	media.addEventListener("change", listener);
	return () => media.removeEventListener("change", listener);
}

function getCoarsePointerSnapshot() {
	return window.matchMedia(COARSE_POINTER_QUERY).matches;
}

const supportDialog = tv({
	slots: {
		content:
			"gap-6 rounded-4xl bg-panel p-7 text-panel-foreground shadow-[0_24px_80px_#00000040] max-mobile:p-6",
		title: "text-[28px] font-[650] text-white",
		description: "text-sm leading-6 text-panel-dim",
		action: "h-11 rounded-full bg-white text-panel hover:bg-inverse-hover",
	},
});

function SupportDialog({
	open,
	onOpenChange,
	title,
	description,
	actionLabel,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	actionLabel: string;
	children: ReactNode;
}) {
	const styles = supportDialog();
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className={styles.content()} showCloseButton={false}>
				<DialogHeader className="gap-2 pr-10">
					<DialogTitle className={styles.title()}>{title}</DialogTitle>
					<DialogDescription className={styles.description()}>
						{description}
					</DialogDescription>
				</DialogHeader>
				{children}
				<DialogClose asChild>
					<Button className={styles.action()}>{actionLabel}</Button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}

type WorkspaceSupport = {
	openTutorial: () => void;
	openAbout: () => void;
};

const WorkspaceSupportContext = createContext<WorkspaceSupport | null>(null);

export function WorkspaceSupportProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [tutorialOpen, setTutorialOpen] = useState(false);
	const [aboutOpen, setAboutOpen] = useState(false);
	const coarsePointer = useSyncExternalStore(
		subscribeToCoarsePointer,
		getCoarsePointerSnapshot,
		() => false,
	);

	useEffect(() => {
		try {
			if (!window.localStorage.getItem(TUTORIAL_STORAGE_KEY))
				setTutorialOpen(true);
		} catch {
			setTutorialOpen(true);
		}
	}, []);

	const setTutorialVisibility = useCallback((open: boolean) => {
		setTutorialOpen(open);
		if (open) return;
		try {
			window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
		} catch {
			// The tutorial remains available from the menu when storage is unavailable.
		}
	}, []);

	const openTutorial = useCallback(() => setTutorialOpen(true), []);
	const openAbout = useCallback(() => setAboutOpen(true), []);
	const support = useMemo(
		() => ({ openTutorial, openAbout }),
		[openTutorial, openAbout],
	);

	return (
		<WorkspaceSupportContext.Provider value={support}>
			{children}
			<SupportDialog
				open={tutorialOpen}
				onOpenChange={setTutorialVisibility}
				title="使用教程"
				description=""
				actionLabel="开始使用"
			>
				<ol className="m-0 grid list-none gap-3 p-0">
					{[
						["01", "选择制品", "从左上角菜单切换制品。"],
						["02", "上传图像", "在调整面板中替换内容图像。"],
						[
							"03",
							"调整预览",
							`设置场景、光照和材质参数。${
								coarsePointer
									? "使用双指缩放/平移，滑动旋转。"
									: "使用鼠标按住左键拖拽旋转，右键拖拽平移，滚轮缩放。"
							}`,
						],
						["04", "导出 PNG", "选择尺寸后保存 PNG 文件。"],
					].map(([index, title, description]) => (
						<li
							key={index}
							className="grid grid-cols-[28px_1fr] gap-3 rounded-2xl bg-white/6 p-3.5"
						>
							<span className="self-center pt-0.5 text-2xl tabular-nums font-medium text-brand">
								{index}
							</span>
							<span className="grid gap-0.5">
								<span className="text-sm font-medium text-white">{title}</span>
								<span className="text-xs leading-5 text-panel-dim">
									{description}
								</span>
							</span>
						</li>
					))}
				</ol>
			</SupportDialog>
			<SupportDialog
				open={aboutOpen}
				onOpenChange={setAboutOpen}
				title="关于"
				description="Goods Preview 是一个在线 3D 制品预览工具。"
				actionLabel="关闭"
			>
				<dl className="m-0 grid gap-3 text-sm">
					<div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
						<dt className="text-panel-dim">版本</dt>
						<dd className="m-0 tabular-nums text-white">{PRODUCT_VERSION}</dd>
					</div>
					<div className="flex items-center justify-between gap-6 rounded-2xl bg-white/6 px-4 py-3">
						<dt className="text-panel-dim">作者</dt>
						<dd className="m-0 text-right leading-6 text-white">
							星寒 / alikia2x
						</dd>
					</div>
					<div className="flex items-center justify-between gap-6 rounded-2xl bg-white/6 px-4 py-3">
						<dt className="text-panel-dim">GitHub</dt>
						<dd className="m-0 text-right leading-6 text-white">
							<a
								href="https://github.com/alikia2x/goods-preview"
								className="underline"
							>
								alikia2x/goods-preview
							</a>
						</dd>
					</div>
				</dl>
			</SupportDialog>
		</WorkspaceSupportContext.Provider>
	);
}

export function useWorkspaceSupport() {
	const support = useContext(WorkspaceSupportContext);
	if (!support)
		throw new Error(
			"useWorkspaceSupport 必须在 WorkspaceSupportProvider 中使用。",
		);
	return support;
}
