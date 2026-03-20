import { Link } from "react-router-dom";
import { Users, Gamepad2, BarChart3, LogIn, UserPlus } from "lucide-react";
import { Button } from "@skillers/ui";

export function LandingPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
			{/* Navigation */}
			<nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="text-2xl font-bold text-orange-600">Skillers</div>
					<div className="flex gap-4">
						<Link to="/login">
							<Button variant="outline" size="sm">
								<LogIn className="w-4 h-4 mr-2" />
								Entrar
							</Button>
						</Link>
						<Link to="/register">
							<Button size="sm" className="bg-orange-600 hover:bg-orange-700">
								<UserPlus className="w-4 h-4 mr-2" />
								Registrar
							</Button>
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
				<div className="mb-8 text-6xl md:text-7xl font-bold">
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
						Skillers Poker Club
					</span>
				</div>
				<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
					A plataforma completa para gerenciar torneios de poker, jogadores e acompanhar o desempenho de todos em tempo real.
				</p>
				<div className="flex gap-4">
					<Link to="/login">
						<Button size="lg" className="bg-orange-600 hover:bg-orange-700">
							Começar Agora
						</Button>
					</Link>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-white dark:bg-gray-900/50 py-16 md:py-24">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
						O que você pode fazer
					</h2>

					<div className="grid md:grid-cols-3 gap-8">
						{/* Feature 1: Players */}
						<div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
							<div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
								<Users className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
								Gerenciar Jogadores
							</h3>
							<ul className="space-y-2 text-gray-700 dark:text-gray-300">
								<li>✓ Cadastro e listagem de jogadores</li>
								<li>✓ Edição de perfils</li>
								<li>✓ Estatísticas detalhadas</li>
								<li>✓ Filtros por status</li>
								<li>✓ Histórico de partidas</li>
							</ul>
						</div>

						{/* Feature 2: Games */}
						<div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-8 border border-purple-200 dark:border-purple-800">
							<div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
								<Gamepad2 className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
								Registrar Partidas
							</h3>
							<ul className="space-y-2 text-gray-700 dark:text-gray-300">
								<li>✓ Criar novas partidas</li>
								<li>✓ Adicionar participantes</li>
								<li>✓ Registrar resultados</li>
								<li>✓ Visualizar detalhes</li>
								<li>✓ Histórico completo</li>
							</ul>
						</div>

						{/* Feature 3: Leaderboard */}
						<div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-8 border border-amber-200 dark:border-amber-800">
							<div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-4">
								<BarChart3 className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
								Acompanhar Rankings
							</h3>
							<ul className="space-y-2 text-gray-700 dark:text-gray-300">
								<li>✓ Ranking de jogadores</li>
								<li>✓ Estatísticas em tempo real</li>
								<li>✓ Lucros e perdas</li>
								<li>✓ Taxa de vitória</li>
								<li>✓ Gráficos de progression</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16 md:py-24">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
						Estatísticas
					</h2>

					<div className="grid md:grid-cols-3 gap-8 text-center">
						<div>
							<div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
								∞
							</div>
							<p className="text-gray-600 dark:text-gray-300 text-lg">
								Jogadores
							</p>
						</div>
						<div>
							<div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
								∞
							</div>
							<p className="text-gray-600 dark:text-gray-300 text-lg">
								Partidas Registradas
							</p>
						</div>
						<div>
							<div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
								24/7
							</div>
							<p className="text-gray-600 dark:text-gray-300 text-lg">
								Disponibilidade
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-orange-600 text-white py-16 md:py-24">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						Pronto para começar?
					</h2>
					<p className="text-lg mb-8 opacity-90">
						Crie sua conta agora e comece a gerenciar suas partidas de poker
					</p>
					<div className="flex gap-4 justify-center flex-wrap">
						<Link to="/register">
							<Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
								Criar Conta Gratuita
							</Button>
						</Link>
						<Link to="/login">
							<Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
								Já tenho conta
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
				<div className="container mx-auto px-4 text-center">
					<p>&copy; 2026 Skillers Poker Club. Todos os direitos reservados.</p>
				</div>
			</footer>
		</div>
	);
}
