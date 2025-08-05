import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";
import { ThemeSwitcher } from "../components/theme-switcher";

export function SettingsPage() {
	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<h1 className="text-3xl font-bold">Configurações</h1>

			<Card>
				<CardHeader>
					<CardTitle>Aparência</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-medium">Tema</h3>
							<p className="text-sm text-muted-foreground">
								Escolha entre tema claro, escuro ou automático
							</p>
						</div>
						<ThemeSwitcher />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Sistema</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<h3 className="text-lg font-medium">Versão</h3>
						<p className="text-sm text-muted-foreground">
							Skillers Poker System v1.0.0
						</p>
					</div>
					
					<div>
						<h3 className="text-lg font-medium">Tecnologias</h3>
						<div className="flex flex-wrap gap-2 mt-2">
							<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
								React 19
							</span>
							<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
								Vite
							</span>
							<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
								NestJS
							</span>
							<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
								Prisma
							</span>
							<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300">
								TailwindCSS
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Preferências do Jogo</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-muted-foreground">
							Em breve: configurações de jogo, notificações e outras preferências.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
