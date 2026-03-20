import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@skillers/ui";
import { Gamepad2, Home, Info, LogOut, Menu, Settings, Trophy, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth-context";
import { ThemeSwitcher } from "./theme-switcher";

export function Header() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const getUserInitials = (displayName: string, username: string) => {
		if (displayName) {
			const names = displayName.split(" ");
			if (names.length >= 2) {
				return `${names[0][0]}${names[1][0]}`.toUpperCase();
			}
			return displayName.substring(0, 2).toUpperCase();
		}
		return username.substring(0, 2).toUpperCase();
	};

	return (
		<header className="border-b bg-card sticky top-0 z-50">
			<div className="container mx-auto px-4 py-3">
				{/* Desktop Layout */}
				<div className="hidden md:flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<Link to="/app" className="flex items-center">
							<h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-poker-orange to-poker-blue">
								Skillers Poker System
							</h1>
						</Link>
					</div>

					{/* Navigation Menu - Centralized */}
					<div className="flex-1 flex justify-center">
						<NavigationMenu>
							<NavigationMenuList>
								<NavigationMenuItem>
									<NavigationMenuLink asChild>
										<Link to="/app" className={navigationMenuTriggerStyle()}>
											<Home className="w-4 h-4 mr-2" />
											Home
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>

								<NavigationMenuItem>
									<NavigationMenuTrigger>
										<User className="w-4 h-4 mr-2" />
										Jogadores
									</NavigationMenuTrigger>
									<NavigationMenuContent>
										<div className="grid gap-3 p-4 w-[400px] lg:w-[500px] lg:grid-cols-2">
											<div className="grid gap-1">
												<Link
													to="/app/players"
													className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
												>
													<div className="text-sm font-medium leading-none">Lista de Jogadores</div>
													<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
														Visualize e gerencie todos os jogadores cadastrados
													</p>
												</Link>
												<Link
													to="/app/players/create"
													className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
												>
													<div className="text-sm font-medium leading-none">Novo Jogador</div>
													<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
														Cadastrar um novo jogador no sistema
													</p>
												</Link>
											</div>
										</div>
									</NavigationMenuContent>
								</NavigationMenuItem>

								<NavigationMenuItem>
									<NavigationMenuTrigger>
										<Gamepad2 className="w-4 h-4 mr-2" />
										Jogos
									</NavigationMenuTrigger>
									<NavigationMenuContent>
										<div className="grid gap-3 p-4 w-[400px] lg:w-[500px] lg:grid-cols-2">
											<div className="grid gap-1">
												<Link
													to="/app/games"
													className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
												>
													<div className="text-sm font-medium leading-none">Lista de Jogos</div>
													<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
														Visualize o histórico de todos os jogos
													</p>
												</Link>
												<Link
													to="/app/games/create"
													className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
												>
													<div className="text-sm font-medium leading-none">Novo Jogo</div>
													<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
														Iniciar um novo jogo de poker
													</p>
												</Link>
											</div>
										</div>
									</NavigationMenuContent>
								</NavigationMenuItem>

								<NavigationMenuItem>
									<NavigationMenuLink asChild>
									<Link to="/app/about" className={navigationMenuTriggerStyle()}>
											<Info className="w-4 h-4 mr-2" />
											About
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>

								<NavigationMenuItem>
									<NavigationMenuLink asChild>
										<Link to="/app/ranking" className={navigationMenuTriggerStyle()}>
											<Trophy className="w-4 h-4 mr-2" />
											Ranking
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
							</NavigationMenuList>
						</NavigationMenu>
					</div>

					{/* User Section - Right aligned */}
					<div className="flex items-center gap-3">
						<ThemeSwitcher />

						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=EC681B`}
											alt={user.displayName || user.username}
										/>
										<AvatarFallback className="bg-primary text-primary-foreground">
											{getUserInitials(user.displayName, user.username)}
										</AvatarFallback>
									</Avatar>
									<div className="hidden lg:flex flex-col items-start">
										<span className="text-sm font-medium">{user.displayName || user.username}</span>
										<span className="text-xs text-muted-foreground">{user.email}</span>
									</div>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<div className="flex items-center gap-2 p-2">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=EC681B`}
												alt={user.displayName || user.username}
											/>
											<AvatarFallback className="bg-primary text-primary-foreground">
												{getUserInitials(user.displayName, user.username)}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<span className="text-sm font-medium">
												{user.displayName || user.username}
											</span>
											<span className="text-xs text-muted-foreground">{user.email}</span>
										</div>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
									<Link to="/app/profile" className="flex items-center">
										<User className="w-4 h-4 mr-2" />
										Perfil
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link to="/app/settings" className="flex items-center">
											<Settings className="w-4 h-4 mr-2" />
											Configurações
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className="text-destructive focus:text-destructive"
									>
										<LogOut className="w-4 h-4 mr-2" />
										Sair
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<div className="flex items-center gap-2">
								<Link
									to="/login"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Entrar
								</Link>
								<Link
									to="/register"
									className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-md transition-colors"
								>
									Cadastrar
								</Link>
							</div>
						)}
					</div>
				</div>

				{/* Mobile Layout */}
				<div className="md:hidden flex items-center justify-between">
					{/* Logo */}
				<Link to="/app" className="flex items-center">
					<h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-poker-orange to-poker-blue">
						Skillers Poker System
					</h1>
				</Link>

					{/* Mobile Menu Button & User */}
					<div className="flex items-center gap-2">
						<ThemeSwitcher />

						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=EC681B`}
											alt={user.displayName || user.username}
										/>
										<AvatarFallback className="bg-primary text-primary-foreground">
											{getUserInitials(user.displayName, user.username)}
										</AvatarFallback>
									</Avatar>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<div className="flex items-center gap-2 p-2">
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}&backgroundColor=EC681B`}
												alt={user.displayName || user.username}
											/>
											<AvatarFallback className="bg-primary text-primary-foreground">
												{getUserInitials(user.displayName, user.username)}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<span className="text-sm font-medium">
												{user.displayName || user.username}
											</span>
											<span className="text-xs text-muted-foreground">{user.email}</span>
										</div>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link to="/app" className="flex items-center">
											<Home className="w-4 h-4 mr-2" />
											Home
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/app/players" className="flex items-center">
											<User className="w-4 h-4 mr-2" />
											Jogadores
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/app/games" className="flex items-center">
											<Gamepad2 className="w-4 h-4 mr-2" />
											Jogos
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/app/about" className="flex items-center">
											<Info className="w-4 h-4 mr-2" />
											About
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/app/ranking" className="flex items-center">
											<Trophy className="w-4 h-4 mr-2" />
											Ranking
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link to="/app/profile" className="flex items-center">
											<User className="w-4 h-4 mr-2" />
											Perfil
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/app/settings" className="flex items-center">
											<Settings className="w-4 h-4 mr-2" />
											Configurações
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className="text-destructive focus:text-destructive"
									>
										<LogOut className="w-4 h-4 mr-2" />
										Sair
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<DropdownMenu>
								<DropdownMenuTrigger className="p-2 hover:bg-accent rounded-md transition-colors">
									<Menu className="w-5 h-5" />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48">
									<DropdownMenuItem asChild>
										<Link to="/" className="flex items-center">
											<Home className="w-4 h-4 mr-2" />
											Home
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/" className="flex items-center">
											<Info className="w-4 h-4 mr-2" />
											About
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link to="/login" className="flex items-center">
											Entrar
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link to="/register" className="flex items-center text-primary">
											Cadastrar
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
