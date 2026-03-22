import { Card, CardContent } from "@skillers/ui";
import {
	ChevronLeft,
	ChevronRight,
	DollarSign,
	Eye,
	Filter,
	Gamepad2,
	MoreVertical,
	Plus,
	Search,
	Trophy,
	Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gameService } from "../services/game.service";
import type { GameListItem } from "../types/game";

type GameFilter = "All Games" | "Active" | "Completed" | "Finished";
type SortOption = "Start Time" | "Prize Pool" | "Players" | "Buy-in";

export function GamesManagement() {
	const navigate = useNavigate();
	const [selectedFilter, setSelectedFilter] = useState<GameFilter>("All Games");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("Start Time");
	const [selectedGames, setSelectedGames] = useState<string[]>([]);
	const [games, setGames] = useState<GameListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [pageSize] = useState(10);

	const filters: GameFilter[] = ["All Games", "Active", "Finished"];
	const filterLabels: Record<GameFilter, string> = {
		"All Games": "Todos os Jogos",
		"Active": "Ativo",
		"Completed": "Encerrado",
		"Finished": "Encerrado",
	};

	const handleStartNewGame = async () => {
		try {
			setLoading(true);
			// Check if there's already an active game
			const activeGames = await gameService.getActiveGames();
			const activeGame = activeGames.find(g => g.status === 'ACTIVE');

			if (activeGame) {
				// If there's an active game, redirect to it
				navigate(`/app/games/${activeGame.id}`);
			} else {
				// Otherwise, go to create game page
				navigate('/app/games/create');
			}
		} catch (err) {
			console.error('Error checking active games:', err);
			// If there's an error, allow navigation to create page
			navigate('/app/games/create');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const loadGames = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await gameService.getAllGames(currentPage, pageSize);
				setGames(response.data);
				setTotalPages(response.pagination.totalPages);
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to load games";
				setError(errorMessage);
				console.error(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		loadGames();
	}, [currentPage, pageSize]);

	const getFilteredGames = () => {
		let filtered = games;

		// Filter by status
		if (selectedFilter !== "All Games") {
			filtered = filtered.filter((game) => {
				const normalizedStatus = game.status.toUpperCase();
				const isActive = normalizedStatus === "ACTIVE";
				const gameStatus = isActive ? "Active" : "Finished";
				return gameStatus === selectedFilter;
			});
		}

		// Filter by search
		if (searchQuery) {
			filtered = filtered.filter((game) =>
				game.id.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		return filtered;
	};

	const getStats = () => {
		const totalGames = games.length;
		const totalPrizePool = games.reduce((sum, game) => sum + game.balance, 0);

		return {
			total: totalGames,
			totalPrizePool,
		};
	};

	const stats = getStats();
	const filteredGames = getFilteredGames();

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "ACTIVE":
				return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
			case "FINISHED":
				return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
			default:
				return null;
		}
	};

	const formatCurrency = (amount: number) => {
		if (amount === 0) return "Grátis";
		return `$${amount.toLocaleString()}`;
	};

	const formatBalance = (balance: number) => {
		const isPositive = balance >= 0;
		const sign = isPositive ? "+" : "";
		return (
			<span className={isPositive ? "text-green-500" : "text-red-500"}>
				{sign}${Math.abs(balance).toLocaleString()}
			</span>
		);
	};

	const toggleSelectAll = () => {
		if (selectedGames.length === filteredGames.length) {
			setSelectedGames([]);
		} else {
			setSelectedGames(filteredGames.map((g) => g.id));
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
				<div>
					<h1 className="text-3xl font-bold mb-2">Gerenciamento de Jogos</h1>
					<p className="text-muted-foreground">
						Monitore e gerencie o cash game do Skillers
					</p>
				</div>
				<button
					type="button"
					onClick={handleStartNewGame}
					disabled={loading}
					className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<Plus className="w-4 h-4" />
					<span>{loading ? 'Carregando...' : 'Iniciar novo jogo'}</span>
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<Gamepad2 className="w-5 h-5 text-orange-500" />
							<div>
								<div className="text-2xl font-bold">{stats.total}</div>
								<div className="text-sm text-muted-foreground">Total de Jogos</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<DollarSign className="w-5 h-5 text-yellow-500" />
							<div>
								<div className="text-2xl font-bold">{formatCurrency(stats.totalPrizePool)}</div>
								<div className="text-sm text-muted-foreground">Premiação Total</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Search */}
			<Card>
				<CardContent className="p-4 md:p-6">
					{/* Tab Filters */}
					<div className="flex flex-wrap space-x-1 bg-muted p-1 rounded-lg w-fit mb-4">
						{filters.map((filter) => (
							<button
								key={filter}
								type="button"
								onClick={() => setSelectedFilter(filter)}
								className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
									selectedFilter === filter
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{filterLabels[filter]}
							</button>
						))}
					</div>

					{/* Search and Filters */}
					<div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:gap-4 md:items-center md:justify-between">
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-1">
							<div className="relative flex-1 max-w-md">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<input
									type="text"
									placeholder="Buscar jogos..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
								/>
							</div>
							<button
								type="button"
								className="p-2 border border-input bg-background hover:bg-accent rounded-md transition-colors self-center sm:self-auto"
							>
								<Filter className="w-4 h-4" />
							</button>
						</div>

						<div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
							<div className="flex items-center space-x-2">
								<span className="text-sm text-muted-foreground whitespace-nowrap">Ordenar por:</span>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as SortOption)}
									className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
								>
									<option value="Start Time">Hora de Início</option>
									<option value="Prize Pool">Premiação</option>
									<option value="Players">Jogadores</option>
									<option value="Buy-in">Buy-in</option>
								</select>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Games Table */}
			<Card>
				<CardContent className="p-0">
					{loading ? (
						<div className="flex items-center justify-center p-12">
							<Loader2 className="w-8 h-8 animate-spin text-orange-500" />
						</div>
					) : error ? (
						<div className="p-12">
							<div className="text-center">
								<p className="text-red-500 font-medium">{error}</p>
								<button
									type="button"
									onClick={() => window.location.reload()}
									className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors"
								>
									Tentar novamente
								</button>
							</div>
						</div>
					) : filteredGames.length === 0 ? (
						<div className="flex items-center justify-center p-12">
							<p className="text-muted-foreground">Nenhum jogo encontrado</p>
						</div>
					) : (
						<>
							{/* Desktop Table View */}
							<div className="hidden lg:block space-y-0">
							{/* Table Header */}
							<div className="grid grid-cols-7 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
								<div>ID do Jogo</div>
								<div>Criado</div>
								<div>Status</div>
								<div>Jogadores</div>
								<div>Total de Buy-ins</div>
								<div>Vencedor</div>
								<div>Ações</div>
							</div>							{/* Table Rows */}
							{filteredGames.map((game) => (
								<div
									key={game.id}
									className="grid grid-cols-7 gap-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0 items-center"
								>
									<div>
										<div className="font-medium text-sm">{game.id}</div>
										</div>

										<div className="text-sm">
											{new Date(game.createdDate).toLocaleDateString()}
										</div>

										<div className="flex items-center space-x-2">
											{getStatusIcon(game.status)}
											<span className="text-sm">{game.status === "ACTIVE" ? "Ativo" : "Encerrado"}</span>
										</div>

										<div className="text-sm">{game.playerCount}</div>

									<div className="text-sm font-medium">{formatCurrency(game.totalBuyIns)}</div>

									<div className="text-sm">
										{game.winner ? (
											<div className="flex items-center space-x-1">
												<Trophy className="w-4 h-4 text-yellow-500" />
												<span className="font-medium">{game.winner}</span>
											</div>
										) : (
											<span className="text-muted-foreground">-</span>
										)}
									</div>

									<div className="flex items-center space-x-1">
										<button
											type="button"
											onClick={() => navigate(`/app/games/${game.id}`)}
											className="p-2 hover:bg-accent rounded-md transition-colors"
											title="Ver Detalhes do Jogo"
										>
											<Eye className="w-4 h-4" />
										</button>
									</div>
									</div>
								))}
							</div>

							{/* Mobile Card View */}
							<div className="lg:hidden space-y-3 p-4">
								{/* Select All Button for Mobile */}
								<div className="flex items-center justify-between pb-2">
									<button
										type="button"
										onClick={toggleSelectAll}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{selectedGames.length === filteredGames.length && filteredGames.length > 0
											? "Desmarcar Todos"
											: "Selecionar Todos"}
									</button>
									<span className="text-sm text-muted-foreground">
										{selectedGames.length} de {filteredGames.length} selecionados
									</span>
								</div>

								{/* Mobile Game Cards */}
								{filteredGames.map((game) => (
									<div
										key={game.id}
										className="border rounded-lg p-4 space-y-3 transition-all duration-200 border-border hover:border-orange-200 hover:shadow-sm"
									>
										{/* Game Header */}
										<div className="flex items-start justify-between">
											<div className="flex-1 min-w-0">
													<div className="font-semibold text-base truncate">Jogo {game.id}</div>
													<div className="text-xs text-muted-foreground">
														Criado: {new Date(game.createdDate).toLocaleDateString()}
													</div>
												</div>
											<div className="flex items-center space-x-2 flex-shrink-0">
												{getStatusIcon(game.status)}
												<span className="text-sm font-medium">
													{game.status === "ACTIVE" ? "Ativo" : "Encerrado"}
												</span>
											</div>
										</div>

										{/* Game Stats Grid */}
										<div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 rounded-lg p-3">
											<div className="space-y-1">
												<span className="text-muted-foreground text-xs">Jogadores</span>
												<div className="font-semibold">{game.playerCount}</div>
											</div>
											<div className="space-y-1">
											<span className="text-muted-foreground text-xs">Total de Buy-ins</span>
											<div className="font-semibold">{formatCurrency(game.totalBuyIns)}</div>
										</div>
										<div className="space-y-1">
											<span className="text-muted-foreground text-xs">Saldo</span>
											<div className="font-semibold">{formatBalance(game.balance)}</div>
											</div>
										<div className="space-y-1">
											<span className="text-muted-foreground text-xs">Vencedor</span>
											<div className="font-semibold flex items-center space-x-1">
												{game.winner ? (
													<>
														<Trophy className="w-4 h-4 text-yellow-500" />
														<span>{game.winner}</span>
													</>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</div>
										</div>
										</div>

										{/* Action Buttons */}
										<div className="flex items-center justify-between pt-3 border-t border-border/50">
											<div className="flex items-center space-x-1">
												<button
													type="button"
													onClick={() => navigate(`/app/games/${game.id}`)}
													className="p-2 hover:bg-accent rounded-md transition-colors"
													title="Ver Detalhes"
												>
													<Eye className="w-4 h-4" />
												</button>
											</div>
											<button
												type="button"
												className="p-2 hover:bg-accent rounded-md transition-colors"
												title="Mais Opções"
											>
												<MoreVertical className="w-4 h-4" />
											</button>
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{/* Pagination */}
					<div className="flex items-center justify-between p-4 border-t">
						<div className="text-sm text-muted-foreground">
							Página {currentPage} de {totalPages}
						</div>
						<div className="flex items-center space-x-1">
							<button
								type="button"
								onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
								className="p-2 border border-input bg-background hover:bg-accent rounded-md transition-colors disabled:opacity-50"
								disabled={currentPage === 1}
								title="Página anterior"
							>
								<ChevronLeft className="w-4 h-4" />
							</button>

							<div className="flex space-x-1 px-2">
								{(() => {
									const pages = [];
									const startPage = Math.max(1, currentPage - 2);
									const endPage = Math.min(totalPages, currentPage + 2);

									if (startPage > 1) {
										pages.push(
											<button
												key={1}
												type="button"
												onClick={() => setCurrentPage(1)}
												className="px-2 py-1 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors"
											>
												1
											</button>
										);
										if (startPage > 2) {
											pages.push(
												<span key="dots-start" className="px-1 py-1 text-muted-foreground">
													...
												</span>
											);
										}
									}

									for (let page = startPage; page <= endPage; page++) {
										pages.push(
											<button
												key={page}
												type="button"
												onClick={() => setCurrentPage(page)}
												className={`px-2 py-1 text-sm rounded-md transition-colors ${
													currentPage === page
														? "bg-orange-500 text-white"
														: "border border-input bg-background hover:bg-accent"
												}`}
											>
												{page}
											</button>
										);
									}

									if (endPage < totalPages) {
										if (endPage < totalPages - 1) {
											pages.push(
												<span key="dots-end" className="px-1 py-1 text-muted-foreground">
													...
												</span>
											);
										}
										pages.push(
											<button
												key={totalPages}
												type="button"
												onClick={() => setCurrentPage(totalPages)}
												className="px-2 py-1 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors"
											>
												{totalPages}
											</button>
										);
									}

									return pages;
								})()}
							</div>

							<button
								type="button"
								onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
								className="p-2 border border-input bg-background hover:bg-accent rounded-md transition-colors disabled:opacity-50"
								disabled={currentPage === totalPages}
								title="Próxima página"
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Action Bar */}
			{selectedGames.length > 0 && (
				<div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:w-auto bg-background border border-border rounded-lg shadow-lg p-4 z-50">
					<div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-4">
						<span className="text-sm font-medium text-center md:text-left">
							{selectedGames.length} selecionados
						</span>
						<div className="grid grid-cols-2 md:flex md:items-center gap-2 md:space-x-2">
							<button
								type="button"
								className="px-3 py-2 text-sm border border-input bg-background hover:bg-accent rounded-md transition-colors flex items-center justify-center space-x-1"
							>
								<span>Exportar</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm border border-input bg-background hover:bg-accent rounded-md transition-colors flex items-center justify-center space-x-1"
							>
								<span>Cancelar</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center justify-center space-x-1 col-span-2 md:col-span-1"
							>
								<span>Gerenciar Selecionados</span>
							</button>
						</div>
					</div>
				</div>
			)}

	</div>
	);
}
