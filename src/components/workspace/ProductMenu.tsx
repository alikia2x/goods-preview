import {
	BookOpen,
	Check,
	ChevronDown,
	GraduationCap,
	History,
	Info,
	Menu,
	type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { HistoryDialog } from "@/components/workspace/HistoryDialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PillButton } from "@/components/workspace/PillButton";
import { useWorkspaceSupport } from "@/components/workspace/WorkspaceSupport";
import { PRODUCT_TUTORIALS } from "@/features/tutorial";
import { ProductTutorialDialog } from "@/features/tutorial/ProductTutorialDialog";
import type { ProductKind } from "@/tuning";

type MenuItem = {
	id: string;
	label: string;
	to?: string;
	icon?: LucideIcon;
	onSelect?: () => void;
};

type MenuGroup = {
	id: string;
	label: string;
	items: MenuItem[];
};

type ProductOption = { id: ProductKind; label: string; to: string };

type ProductGroup = { id: string; label: string; items: ProductOption[] };

const PRODUCT_ENTRIES: (ProductGroup | ProductOption)[] = [
	{
		id: "badge",
		label: "吧唧",
		items: [{ id: "badge", label: "覆膜吧唧", to: "/workspace/badge" }],
	},
	{
		id: "acrylic",
		label: "亚克力",
		items: [
			{ id: "keychain", label: "亚克力钥匙扣", to: "/workspace/keychain" },
			{ id: "standee", label: "亚克力立牌", to: "/workspace/standee" },
			{ id: "acrylic", label: "任意亚克力", to: "/workspace/acrylic" },
		],
	},
	{ id: "ticket", label: "镭射票", to: "/workspace/ticket" },
];

export function ProductMenu({ product }: { product: ProductKind }) {
	const [open, setOpen] = useState(false);
	const [historyOpen, setHistoryOpen] = useState(false);
	const [tutorialOpen, setTutorialOpen] = useState(false);
	const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
	const { openAbout, openTutorial } = useWorkspaceSupport();
	const tutorial = PRODUCT_TUTORIALS[product];
	const groups: MenuGroup[] = [
		{
			id: "tutorial",
			label: "教程",
			items: [
				{
					id: "basic-tutorial",
					label: "基础教程",
					icon: BookOpen,
					onSelect: openTutorial,
				},
				{
					id: "product-tutorial",
					label: `${tutorial.title}教程`,
					icon: GraduationCap,
					onSelect: () => setTutorialOpen(true),
				},
			],
		},
		{
			id: "about",
			label: "关于",
			items: [
				{
					id: "about-goods-preview",
					label: "Goods Preview",
					icon: Info,
					onSelect: openAbout,
				},
			],
		},
	];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<PillButton icon aria-label="打开菜单">
					<Menu className="size-5" />
				</PillButton>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="scrollbar-hidden max-h-[min(32rem,calc(100dvh-2rem))] overflow-y-auto"
			>
				<div className="grid gap-1.5">
					<span className="px-2.5 text-xs text-panel-subtle">制品</span>
					{PRODUCT_ENTRIES.map((entry) => {
						if (!("items" in entry)) {
							return (
								<Button
									asChild
									variant="ghost"
									className="w-full justify-between"
									key={entry.id}
								>
									<Link
										to={entry.to}
										onClick={() => setOpen(false)}
										aria-current={product === entry.id ? "page" : undefined}
									>
										{entry.label}
										{product === entry.id && <Check />}
									</Link>
								</Button>
							);
						}

						const expanded = expandedProduct === entry.id;
						const active = entry.items.some((item) => item.id === product);
						return (
							<div className="grid gap-1" key={entry.id}>
								<Button
									variant="ghost"
									className="w-full justify-between"
									onClick={() => setExpandedProduct(expanded ? null : entry.id)}
								>
									{entry.label}
									{active && !expanded ? (
										<Check />
									) : (
										<ChevronDown
											className={expanded ? "rotate-180" : undefined}
										/>
									)}
								</Button>
								{expanded && (
									<div className="ml-4 grid gap-1">
										{entry.items.map((item) => (
											<Button
												asChild
												variant="ghost"
												className="w-full justify-between"
												key={item.id}
											>
												<Link
													to={item.to}
													onClick={() => setOpen(false)}
													aria-current={
														product === item.id ? "page" : undefined
													}
												>
													{item.label}
													{product === item.id && <Check />}
												</Link>
											</Button>
										))}
									</div>
								)}
							</div>
						);
					})}
				</div>
				<div className="grid gap-1.5">
					<Button
						variant="ghost"
						className="w-full justify-start"
						onClick={() => {
							setOpen(false);
							setHistoryOpen(true);
						}}
					>
						<History />
						历史记录
					</Button>
				</div>
				{groups.map((group) => (
					<div className="grid gap-1.5" key={group.id}>
						<span className="px-2.5 text-xs text-panel-subtle">
							{group.label}
						</span>
						{group.items.map((item) => {
							const Icon = item.icon;
							return (
								<Button
									variant="ghost"
									className="w-full justify-start"
									key={item.id}
									onClick={() => {
										setOpen(false);
										item.onSelect?.();
									}}
								>
									{Icon && <Icon />}
									{item.label}
								</Button>
							);
						})}
					</div>
				))}
			</PopoverContent>
			<HistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} />
			<ProductTutorialDialog
				product={product}
				open={tutorialOpen}
				onOpenChange={setTutorialOpen}
			/>
		</Popover>
	);
}
