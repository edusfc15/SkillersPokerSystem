import { Link, useLocation } from "react-router-dom";
import { Gamepad2, Home, Trophy, Users } from "lucide-react";

const TABS = [
	{
		label: "Home",
		icon: Home,
		href: "/app",
		isActive: (pathname: string) => pathname === "/app",
	},
	{
		label: "Jogadores",
		icon: Users,
		href: "/app/players",
		isActive: (pathname: string) => pathname.startsWith("/app/players"),
	},
	{
		label: "Jogos",
		icon: Gamepad2,
		href: "/app/games",
		isActive: (pathname: string) => pathname.startsWith("/app/games"),
	},
	{
		label: "Ranking",
		icon: Trophy,
		href: "/app/ranking",
		isActive: (pathname: string) => pathname.startsWith("/app/ranking"),
	},
] as const;

export function BottomTabBar() {
	const { pathname } = useLocation();

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 h-14 bg-card border-t flex md:hidden" aria-label="Navegação principal">
			{TABS.map(({ label, icon: Icon, href, isActive }) => {
				const active = isActive(pathname);
				return (
					<Link
						key={href}
						to={href}
						aria-current={active ? "page" : undefined}
						className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
							active ? "text-primary" : "text-muted-foreground hover:text-foreground"
						}`}
					>
						<Icon className="w-5 h-5" />
						<span className="text-[10px] font-medium">{label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
