import { Check, Menu } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export function ProductMenu({ product }: { product: "badge" | "keychain" }) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="pill menu-button" aria-label="切换制品">
					<Menu />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="menu-content">
				<span className="small-label">制品</span>
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
