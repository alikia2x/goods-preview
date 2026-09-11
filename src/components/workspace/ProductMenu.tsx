import { BookOpen, Check, Info, Menu, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PillButton } from "@/components/workspace/PillButton";
import { useWorkspaceSupport } from "@/components/workspace/WorkspaceSupport";

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

const PRODUCT_OPTIONS = [
	{ id: "badge", label: "覆膜吧唧", to: "/workspace/badge" },
	{ id: "keychain", label: "亚克力钥匙扣", to: "/workspace/keychain" },
] satisfies MenuItem[];

export function ProductMenu({ product }: { product: "badge" | "keychain" }) {
	const [open, setOpen] = useState(false);
	const { openAbout, openTutorial } = useWorkspaceSupport();
	const groups: MenuGroup[] = [
		{ id: "products", label: "制品", items: PRODUCT_OPTIONS },
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
			<PopoverContent align="start">
				{groups.map((group) => (
					<div className="grid gap-1.5" key={group.id}>
						<span className="px-2.5 text-xs text-panel-subtle">
							{group.label}
						</span>
						{group.items.map((item) => {
							const Icon = item.icon;
							if (item.to)
								return (
									<Button
										asChild
										variant="ghost"
										className="w-full justify-between"
										key={item.id}
									>
										<Link
											to={item.to}
											onClick={() => setOpen(false)}
											aria-current={product === item.id ? "page" : undefined}
										>
											{item.label}
											{product === item.id && <Check />}
										</Link>
									</Button>
								);
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
		</Popover>
	);
}
