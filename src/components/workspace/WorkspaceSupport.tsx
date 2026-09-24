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
import { SupportDialog } from "@/components/workspace/SupportDialog";
import { AnalyticsDisclosure } from "@/features/analytics/AnalyticsDisclosure";
import { trackAboutView, trackTutorialView } from "@/features/analytics/events";
import { productFromPathname } from "@/app/routes";
import { PRODUCT_VERSION } from "@/features/badge/constants";
import { TutorialStep, TutorialSteps } from "@/features/tutorial";

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
		const firstVisit = (() => {
			try {
				return !window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
			} catch {
				return true;
			}
		})();
		if (!firstVisit) return;
		// A tutorial nobody opened is not readership, so the automatic showing is
		// reported separately from the menu entry.
		trackTutorialView("auto", productFromPathname(window.location.pathname));
		setTutorialOpen(true);
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
	const openAbout = useCallback(() => {
		trackAboutView();
		setAboutOpen(true);
	}, []);
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
				description="你可以点击左上角菜单回顾此教程，并查看针对每个制品的教程说明。"
				actionLabel="开始使用"
			>
				<TutorialSteps>
					<TutorialStep title="选择制品">从左上角菜单切换制品。</TutorialStep>
					<TutorialStep title="上传图像">
						在调整面板中替换内容图像。
					</TutorialStep>
					<TutorialStep title="调整工艺">
						点击左上角的制品名称按钮，可以调整具体的工艺或尺寸参数。
					</TutorialStep>
					<TutorialStep title="调整预览">
						设置场景、光照和材质参数。
						{coarsePointer
							? "使用双指缩放/平移，滑动旋转。"
							: "使用鼠标按住左键拖拽旋转，右键拖拽平移，滚轮缩放。"}
					</TutorialStep>
					<TutorialStep title="导出 PNG">
						选择尺寸后保存 PNG 文件。
					</TutorialStep>
				</TutorialSteps>
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
				<AnalyticsDisclosure />
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
