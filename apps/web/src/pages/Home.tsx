import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@skillers/ui";
import { Suspense } from "react";
import { AuthSection } from "../components/auth-section";
import { SplitText } from "../components/split-text";

export function Home() {
	return (
		<div className="space-y-8">
			{/* Hero Section com animação */}
			<div className="text-center py-12">
				<Suspense fallback={<div className="text-4xl font-bold">Loading...</div>}>
					<SplitText
						text="Bem-vindo ao Poker"
						className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-poker-orange to-poker-blue mb-4"
						delay={100}
						charDelay={50}
					/>
				</Suspense>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">Skiller poker System</p>
			</div>

			{/* Cards de funcionalidades */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>📊 Rankings</CardTitle>
						<CardDescription>Sistema de pontuação e classificação de jogadores</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Acompanhe o desempenho e evolução dos jogadores
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>👥 Jogadores</CardTitle>
						<CardDescription>Cadastro e gestão de perfis de jogadores</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">
							Histórico completo de partidas e estatísticas
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
