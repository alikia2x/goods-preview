import { Check, Menu } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import controlStyles from "@/styles/studio-controls.module.css";
import { PILL_CLASS_NAME, SMALL_LABEL_CLASS_NAME } from "./classNames";

export function ProductMenu({ product }: { product: "badge" | "keychain" }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					className={`${PILL_CLASS_NAME} w-[46px] p-0 max-[700px]:!size-11 max-[700px]:min-w-11`}
					aria-label="切换制品"
				>
					<Menu className="size-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className={`${controlStyles.popoverContent} max-[700px]:select-none`}
			>
				<span className={SMALL_LABEL_CLASS_NAME}>制品</span>
				{(
					[
						{ id: "badge", label: "覆膜吧唧" },
						{ id: "keychain", label: "亚克力钥匙扣" },
					] as const
				).map((item) => (
					<Button
						asChild
						variant="ghost"
						className="w-full justify-between"
						key={item.id}
					>
						<Link
							to={`/workspace/${item.id}`}
							aria-current={product === item.id ? "page" : undefined}
						>
							{item.label}
							{product === item.id && <Check />}
						</Link>
					</Button>
				))}
			</PopoverContent>
		</Popover>
	);
}
