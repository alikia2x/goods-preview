import { BookOpen, Check, Info, Menu, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import controlStyles from "@/styles/studio-controls.module.css";
import { useWorkspaceSupport } from "./WorkspaceSupport";

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
				<Button
					variant="ghost"
					className="inline-flex h-[46px] w-11.5 items-center justify-center gap-[9px] !rounded-full !bg-[#292929] p-0 text-sm font-[550] whitespace-nowrap !text-[#fafafa] shadow-[0_5px_15px_#00000015] hover:!bg-[#3b3b3b] max-[700px]:size-11! max-[700px]:min-w-11"
					aria-label="打开菜单"
				>
					<Menu className="size-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className={`${controlStyles.popoverContent} max-[700px]:select-none`}
			>
				{groups.map((group) => (
					<div className="grid gap-1.5" key={group.id}>
						<span className="px-2.5 text-xs text-[#aaa]">{group.label}</span>
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
