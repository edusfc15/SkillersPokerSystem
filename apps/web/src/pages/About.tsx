import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";

export function About() {
	return (
		<div className="space-y-8">
			<div className="text-center">
				<h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-poker-orange to-poker-blue mb-4">
					Sobre o Skillers Poker System
				</h1>
				<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
					Uma plataforma completa para gerenciamento de torneios de poker e ranking de jogadores
					profissionais
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<Card>
					<CardHeader>
						<CardTitle>🎯 Nossa Missão</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Fornecer as melhores ferramentas para organização de torneios de poker, permitindo que
							organizadores e jogadores tenham uma experiência profissional e transparente.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>⚡ Tecnologias</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span>Frontend:</span>
								<span className="text-muted-foreground">React + Vite</span>
							</div>
							<div className="flex justify-between">
								<span>Backend:</span>
								<span className="text-muted-foreground">NestJS</span>
							</div>
							<div className="flex justify-between">
								<span>Database:</span>
								<span className="text-muted-foreground">Prisma + PostgreSQL</span>
							</div>
							<div className="flex justify-between">
								<span>Styling:</span>
								<span className="text-muted-foreground">Tailwind CSS</span>
							</div>
							<div className="flex justify-between">
								<span>UI Components:</span>
								<span className="text-muted-foreground">shadcn/ui</span>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>🏆 Funcionalidades</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>• Criação e gestão de torneios</li>
							<li>• Sistema de ranking e pontuação</li>
							<li>• Cadastro de jogadores</li>
							<li>• Histórico de partidas</li>
							<li>• Estatísticas detalhadas</li>
							<li>• Sistema de autenticação</li>
							<li>• Interface responsiva</li>
							<li>• Temas claro/escuro</li>
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>🎨 Design System</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-4 h-4 rounded-full bg-poker-orange"></div>
								<span className="text-sm">Vibrant Orange (#EC681B)</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#3B7EC1] to-[#292E6B]"></div>
								<span className="text-sm">Blue Gradient</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-4 h-4 rounded-full border border-muted-foreground bg-background"></div>
								<span className="text-sm">Adaptive Colors</span>
							</div>
							<p className="text-xs text-muted-foreground mt-4">
								Cores que se adaptam automaticamente aos temas claro e escuro
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card className="winner-highlight">
				<CardHeader>
					<CardTitle className="text-center">🎉 Sistema em Desenvolvimento</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-center opacity-90">
						Estamos constantemente melhorando e adicionando novas funcionalidades para oferecer a
						melhor experiência possível!
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
