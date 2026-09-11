import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
	useSyncExternalStore,
} from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { PRODUCT_VERSION } from "@/lib/badge/constants";

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

	return (
		<WorkspaceSupportContext.Provider
			value={{
				openTutorial: () => setTutorialOpen(true),
				openAbout: () => setAboutOpen(true),
			}}
		>
			{children}
			<Dialog open={tutorialOpen} onOpenChange={setTutorialVisibility}>
				<DialogContent
					className="gap-6 rounded-4xl bg-[#292929] p-7
				 text-[#fafafa] shadow-[0_24px_80px_#00000040] max-[700px]:p-6"
					showCloseButton={false}
				>
					<DialogHeader className="gap-2 pr-10">
						<DialogTitle className="text-[28px] font-[650] text-white">
							上手教程
						</DialogTitle>
						<DialogDescription className="text-sm leading-6 text-[#bdbdbd]">
							从图像到 PNG，只需完成这四步。
						</DialogDescription>
					</DialogHeader>
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
								<span className="self-center pt-0.5 text-2xl tabular-nums font-medium text-[#009fff]">
									{index}
								</span>
								<span className="grid gap-0.5">
									<span className="text-sm font-medium text-white">
										{title}
									</span>
									<span className="text-xs leading-5 text-[#bdbdbd]">
										{description}
									</span>
								</span>
							</li>
						))}
					</ol>
					<DialogClose asChild>
						<Button className="h-11 rounded-full bg-white text-[#292929] hover:bg-[#e6e6e6]">
							开始使用
						</Button>
					</DialogClose>
				</DialogContent>
			</Dialog>
			<Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
				<DialogContent
					className="gap-6 rounded-4xl bg-[#292929] p-7
					 text-[#fafafa] shadow-[0_24px_80px_#00000040] max-[700px]:p-6"
					showCloseButton={false}
				>
					<DialogHeader className="gap-2 pr-10">
						<DialogTitle className="text-[28px] font-[650] text-white">
							关于
						</DialogTitle>
						<DialogDescription className="text-sm leading-6 text-[#bdbdbd]">
							Goods Preview 是一个在线 3D 制品预览工具。
						</DialogDescription>
					</DialogHeader>
					<dl className="m-0 grid gap-3 text-sm">
						<div className="flex items-center justify-between rounded-2xl bg-white/6 px-4 py-3">
							<dt className="text-[#bdbdbd]">版本</dt>
							<dd className="m-0 tabular-nums text-white">{PRODUCT_VERSION}</dd>
						</div>
						<div className="flex items-center justify-between gap-6 rounded-2xl bg-white/6 px-4 py-3">
							<dt className="text-[#bdbdbd]">作者</dt>
							<dd className="m-0 text-right leading-6 text-white">
								星寒 / alikia2x
							</dd>
						</div>
						<div className="flex items-center justify-between gap-6 rounded-2xl bg-white/6 px-4 py-3">
							<dt className="text-[#bdbdbd]">GitHub</dt>
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
					<DialogClose asChild>
						<Button className="h-11 rounded-full bg-white text-[#292929] hover:bg-[#e6e6e6]">
							关闭
						</Button>
					</DialogClose>
				</DialogContent>
			</Dialog>
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
