import { Avatar, AvatarFallback, AvatarImage, Card, CardContent } from "@skillers/ui";
import {
	ChevronLeft,
	ChevronRight,
	Edit,
	Eye,
	Filter,
	MoreVertical,
	RotateCcw,
	Search,
	UserPlus,
	Users,
	UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/auth-context";
import { playerHttpService } from "../http/player.service";
import { PlayerDetailModal } from "./player-detail-modal";
import { PlayerEditModal } from "./player-edit-modal";
import { PlayerCreateModal } from "./player-create-modal";

interface Player {
	id: string;
	name: string;
	email?: string;
	status?: "Ativo" | "Inativo";
	registrationDate?: string;
	registrationDateFormatted?: string;
	lastActivity?: string;
	lastActivityFormatted?: string;
	totalProfit?: number;
	gamesPlayed?: number;
	imageurl?: string;
	avatar?: string;
	selected?: boolean;
	isactive?: boolean;
}

type TabFilter = "Todos os Jogadores" | "Ativos" | "Inativos";
type SortOption = "Data de Registro" | "Ultima partida" | "Lucro Total" | "Partidas Jogadas";

export function PlayersManagement() {
	const { user } = useAuth();
	const [selectedTab, setSelectedTab] = useState<TabFilter>("Todos os Jogadores");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("Ultima partida");
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [players, setPlayers] = useState<Player[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [detailModalOpen, setDetailModalOpen] = useState(false);
	const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const loadPlayers = async () => {
		try {
			setLoading(true);
			setError(null);
			const backendPlayers = await playerHttpService.getActivePlayers();
			// Converte bigint para string e mapeia para interface Player
			const mappedPlayers: Player[] = backendPlayers.map((p) => ({
				id: String(p.id),
				name: p.name,
				imageurl: p.imageurl,
				status: p.isactive ? "Ativo" : "Inativo",
				isactive: p.isactive,
				email: undefined,
				registrationDate: p.registrationDate,
				registrationDateFormatted: p.registrationDateFormatted,
				lastActivity: p.lastActivity,
				lastActivityFormatted: p.lastActivityFormatted,
				totalProfit: p.totalProfit,
				gamesPlayed: p.gamesPlayed,
			}));
			setPlayers(mappedPlayers);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erro ao carregar jogadores");
			console.error("Erro ao carregar jogadores:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleEditSuccess = () => {
		// Reload players after edit
		loadPlayers();
	};

	useEffect(() => {
		loadPlayers();
	}, []);

	const tabs: TabFilter[] = ["Todos os Jogadores", "Ativos", "Inativos"];

	const ITEMS_PER_PAGE = 10;

	const getFilteredPlayers = () => {
		let filtered = players;

		// Filter by tab
		if (selectedTab !== "Todos os Jogadores") {
			filtered = filtered.filter((player) => player.status === selectedTab);
		}

		// Filter by search
		if (searchQuery) {
			filtered = filtered.filter(
				(player) =>
					player.name.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		// Sort
		const sorted = [...filtered].sort((a, b) => {
			switch (sortBy) {
				case "Data de Registro":
					const dateA = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
					const dateB = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
					return dateB - dateA; // Mais recente primeiro
				
				case "Ultima partida":
					const lastA = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
					const lastB = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
					return lastB - lastA; // Mais recente primeiro
				
				case "Lucro Total":
					const profitA = a.totalProfit ?? 0;
					const profitB = b.totalProfit ?? 0;
					return profitB - profitA; // Maior primeiro
				
				case "Partidas Jogadas":
					const gamesA = a.gamesPlayed ?? 0;
					const gamesB = b.gamesPlayed ?? 0;
					return gamesB - gamesA; // Maior primeiro
				
				default:
					return 0;
			}
		});

		return sorted;
	};

	const getStats = () => {
		const totalPlayers = players.length;
		const activePlayers = players.filter((p) => p.status === "Ativo").length;
		const inactivePlayers = players.filter((p) => p.status === "Inativo").length;

		return {
			total: totalPlayers,
			active: activePlayers,
			inactive: inactivePlayers,
		};
	};

	const stats = getStats();
	const filteredPlayers = getFilteredPlayers();
	const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedTab, searchQuery]);

	const handlePreviousPage = () => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	};

	const handlePageClick = (page: number) => {
		setCurrentPage(page);
	};

	const getPageNumbers = () => {
		const pages: number[] = [];
		const maxPagesToShow = 5;

		if (totalPages <= maxPagesToShow) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				for (let i = 1; i <= maxPagesToShow; i++) {
					pages.push(i);
				}
			} else if (currentPage >= totalPages - 2) {
				for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				for (let i = currentPage - 2; i <= currentPage + 2; i++) {
					pages.push(i);
				}
			}
		}

		return pages;
	};

	const getStatusIcon = (status: string | undefined) => {
		switch (status) {
			case "Ativo":
				return <div className="w-2 h-2 bg-green-500 rounded-full" />;
			case "Inativo":
				return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
			default:
				return null;
		}
	};

	const formatProfit = (profit: number | undefined) => {
		if (profit === undefined) {
			return <span className="text-gray-500">-</span>;
		}
		const isPositive = profit >= 0;
		const sign = isPositive ? "+" : "";
		return (
			<span className={isPositive ? "text-green-500" : "text-red-500"}>
				{sign}${Math.abs(profit).toLocaleString()}
			</span>
		);
	};

	const getUserInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase();
	};

	const togglePlayerSelection = (playerId: string) => {
		setSelectedPlayers((prev) =>
			prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId],
		);
	};

	const toggleSelectAll = () => {
		if (selectedPlayers.length === filteredPlayers.length) {
			setSelectedPlayers([]);
		} else {
			setSelectedPlayers(filteredPlayers.map((p) => p.id));
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold mb-2">Gerenciamento de Jogadores</h1>
					<p className="text-muted-foreground">
						Gerencie seus jogadores, visualize estatísticas, e mantenha tudo sob controle em um só lugar.
					</p>
				</div>
				<button
					type="button"
					onClick={() => setCreateModalOpen(true)}
					className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
				>
					<UserPlus className="w-4 h-4" />
					<span>Adicionar Jogador</span>
				</button>
			</div>

			{/* Error Message */}
			{error && (
				<div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
					<p className="text-sm text-red-800 dark:text-red-200">Erro: {error}</p>
				</div>
			)}

			{/* Loading State */}
			{loading && (
				<div className="flex items-center justify-center p-8">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
						<p className="text-muted-foreground">Carregando jogadores...</p>
					</div>
				</div>
			)}

			{!loading && (
				<>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<Users className="w-5 h-5 text-orange-500" />
							<div>
								<div className="text-2xl font-bold">{stats.total}</div>
								<div className="text-sm text-muted-foreground">Total de Jogadores</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<UserPlus className="w-5 h-5 text-blue-500" />
							<div>
								<div className="text-2xl font-bold">{stats.active}</div>
								<div className="text-sm text-muted-foreground">Jogadores Ativos</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<UserX className="w-5 h-5 text-gray-500" />
							<div>
								<div className="text-2xl font-bold">{stats.inactive}</div>
								<div className="text-sm text-muted-foreground">Jogadores Inativos</div>
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
						{tabs.map((tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => setSelectedTab(tab)}
								className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
									selectedTab === tab
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{tab}
							</button>
						))}
					</div>

					{/* Search and Sort */}
					<div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:gap-4 md:items-center md:justify-between">
						<div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 flex-1">
							<div className="relative flex-1 max-w-md">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
								<input
									type="text"
									placeholder="Procurar jogadores..."
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

						<div className="flex items-center space-x-2">
							<span className="text-sm text-muted-foreground whitespace-nowrap">Ordenar por:</span>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as SortOption)}
								className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring flex-1 md:flex-none"
							>
								<option value="Data de Registro">Data de Registro</option>
								<option value="Ultima partida">Última Partida</option>
								<option value="Lucro Total">Lucro Total</option>
								<option value="Partidas Jogadas">Partidas Jogadas</option>
							</select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Players Table */}
			<Card>
				<CardContent className="p-0">
					{/* Desktop Table View */}
					<div className="hidden md:block space-y-0">
						{/* Table Header */}
						<div className="grid grid-cols-8 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={
										selectedPlayers.length === paginatedPlayers.length && paginatedPlayers.length > 0
									}
									onChange={toggleSelectAll}
									className="rounded border-gray-300"
								/>
							</div>
							<div>Jogador</div>
							<div>Status</div>
							<div>Registro</div>
							<div>Última Partida</div>
							<div>Lucro Total</div>
							<div>Partidas Jogadas</div>
							<div>Ações</div>
						</div>

						{/* Table Rows */}
						{paginatedPlayers.map((player) => (
							<div
								key={player.id}
								className="grid grid-cols-8 gap-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
							>
								<div className="flex items-center">
									<input
										type="checkbox"
										checked={selectedPlayers.includes(player.id)}
										onChange={() => togglePlayerSelection(player.id)}
										className="rounded border-gray-300"
									/>
								</div>

								<div className="flex items-center space-x-3">
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={player.imageurl || `https://api.dicebear.com/7.x/initials/svg?seed=${player.name}&backgroundColor=EC681B`}
											alt={player.name}
										/>
										<AvatarFallback className="bg-primary text-primary-foreground text-xs">
											{getUserInitials(player.name)}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium text-sm">{player.name}</div>
										<div className="text-xs text-muted-foreground">ID: {player.id}</div>
									</div>
								</div>

								<div className="flex items-center space-x-2">
									{getStatusIcon(player.status)}
									<span className="text-sm">{player.status}</span>
								</div>

									<div className="text-sm">{player.registrationDateFormatted || player.registrationDate}</div>
									<div className="text-sm">{player.lastActivityFormatted || player.lastActivity}</div>
								<div>{formatProfit(player.totalProfit)}</div>
								<div className="font-medium">{player.gamesPlayed}</div>

								<div className="flex items-center space-x-1">
									<button
										type="button"
										onClick={() => {
											setSelectedPlayerId(player.id);
											setDetailModalOpen(true);
										}}
										className="p-1 hover:bg-accent rounded transition-colors"
										title="Ver Detalhes"
									>
										<Eye className="w-4 h-4" />
									</button>
									<button
										type="button"
										onClick={() => {
											setEditingPlayerId(player.id);
											setEditModalOpen(true);
										}}
										className="p-1 hover:bg-accent rounded transition-colors"
										title="Editar Jogador"
									>
										<Edit className="w-4 h-4" />
									</button>
									<button
										type="button"
										className="p-1 hover:bg-accent rounded transition-colors"
										title="Redefinir Senha"
									>
										<RotateCcw className="w-4 h-4" />
									</button>
									<button
										type="button"
										className="p-1 hover:bg-accent rounded transition-colors"
										title="Mais Opções"
									>
										<MoreVertical className="w-4 h-4" />
									</button>
								</div>
							</div>
						))}
					</div>

					{/* Mobile Card View */}
					<div className="md:hidden space-y-3 p-4">
						{/* Select All Button for Mobile */}
						<div className="flex items-center justify-between pb-2">
							<button
								type="button"
								onClick={toggleSelectAll}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								{selectedPlayers.length === paginatedPlayers.length && paginatedPlayers.length > 0
									? "Desselecionar Todos"
									: "Selecionar Todos"}
							</button>
							<span className="text-sm text-muted-foreground">
								{selectedPlayers.length} de {filteredPlayers.length} selecionados
							</span>
						</div>

						{/* Mobile Player Cards */}
						{paginatedPlayers.map((player) => (
							<div
								key={player.id}
								className={`border rounded-lg p-4 space-y-3 transition-all duration-200 ${
									selectedPlayers.includes(player.id)
										? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-sm"
										: "border-border hover:border-orange-200 hover:shadow-sm"
								}`}
							>
								{/* Player Header */}
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-3 flex-1 min-w-0">
										<input
											type="checkbox"
											checked={selectedPlayers.includes(player.id)}
											onChange={() => togglePlayerSelection(player.id)}
											className="rounded border-gray-300 mt-1"
										/>
										<Avatar className="h-12 w-12 flex-shrink-0">
											<AvatarImage
												src={player.imageurl || `https://api.dicebear.com/7.x/initials/svg?seed=${player.name}&backgroundColor=EC681B`}
												alt={player.name}
											/>
											<AvatarFallback className="bg-primary text-primary-foreground text-sm">
												{getUserInitials(player.name)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<div className="font-semibold text-base truncate">{player.name}</div>
											<div className="text-sm text-muted-foreground truncate">ID: {player.id}</div>
										</div>
									</div>
									<div className="flex items-center space-x-2 flex-shrink-0">
										{getStatusIcon(player.status)}
										<span className="text-sm font-medium">{player.status}</span>
									</div>
								</div>

								{/* Player Stats Grid */}
								<div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 rounded-lg p-3">
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Lucro Total</span>
										<div className="font-semibold">{formatProfit(player.totalProfit)}</div>
									</div>
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Partidas Jogadas</span>
										<div className="font-semibold">{player.gamesPlayed}</div>
									</div>
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Registro</span>
										<div className="font-medium text-xs">{player.registrationDateFormatted || player.registrationDate}</div>
									</div>
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Última Partida</span>
										<div className="font-medium text-xs">{player.lastActivityFormatted || player.lastActivity}</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center justify-between pt-3 border-t border-border/50">
									<div className="flex items-center space-x-1">
										<button
											type="button"
											onClick={() => {
												setSelectedPlayerId(player.id);
												setDetailModalOpen(true);
											}}
											className="p-2 hover:bg-accent rounded-md transition-colors"
											title="Ver Detalhes"
										>
											<Eye className="w-4 h-4" />
										</button>
										<button
											type="button"
											onClick={() => {
												setEditingPlayerId(player.id);
												setEditModalOpen(true);
											}}
											className="p-2 hover:bg-accent rounded-md transition-colors"
											title="Editar Jogador"
										>
											<Edit className="w-4 h-4" />
										</button>
										<button
											type="button"
											className="p-2 hover:bg-accent rounded-md transition-colors"
											title="Redefinir Senha"
										>
											<RotateCcw className="w-4 h-4" />
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

					{/* Pagination */}
					<div className="flex items-center justify-between p-4 border-t">
						<div className="text-sm text-muted-foreground">
							Exibindo {filteredPlayers.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredPlayers.length)} de {filteredPlayers.length} jogadores
						</div>
						<div className="flex items-center space-x-2">
							<button
								type="button"
								onClick={handlePreviousPage}
								className="p-2 border border-input bg-background hover:bg-accent rounded-md transition-colors disabled:opacity-50"
								disabled={currentPage === 1}
							>
								<ChevronLeft className="w-4 h-4" />
							</button>

							<div className="flex space-x-1">
								{getPageNumbers().map((page) => (
									<button
										key={page}
										type="button"
										onClick={() => handlePageClick(page)}
										className={`px-3 py-1 text-sm rounded-md transition-colors ${
											currentPage === page ? "bg-orange-500 text-white" : "hover:bg-accent"
										}`}
									>
										{page}
									</button>
								))}
							</div>

							<button
								type="button"
								onClick={handleNextPage}
								className="p-2 border border-input bg-background hover:bg-accent rounded-md transition-colors disabled:opacity-50"
								disabled={currentPage === totalPages || totalPages === 0}
							>
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Action Bar */}
			{selectedPlayers.length > 0 && (
				<div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:w-auto bg-background border border-border rounded-lg shadow-lg p-4 z-50">
					<div className="flex flex-col md:flex-row items-stretch md:items-center space-y-3 md:space-y-0 md:space-x-4">
						<span className="text-sm font-medium text-center md:text-left">
							{selectedPlayers.length} selecionados
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
								<span>Suspender</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm border border-input bg-background hover:bg-accent rounded-md transition-colors flex items-center justify-center space-x-1"
							>
								<span>Ativar</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center justify-center space-x-1"
							>
								<span>Bônus</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm border border-input bg-background hover:bg-accent rounded-md transition-colors flex items-center justify-center space-x-1 col-span-2 md:col-span-1"
							>
								<span>Notificar</span>
							</button>
						</div>
					</div>
				</div>
			)}
				</>
			)}

			{/* Player Detail Modal */}
			<PlayerDetailModal
				isOpen={detailModalOpen}
				onClose={() => {
					setDetailModalOpen(false);
					setSelectedPlayerId(null);
				}}
				playerId={selectedPlayerId}
			/>

			{/* Player Edit Modal */}
			<PlayerEditModal
				isOpen={editModalOpen}
				onClose={() => {
					setEditModalOpen(false);
					setEditingPlayerId(null);
				}}
				playerId={editingPlayerId}
				onSuccess={handleEditSuccess}
			/>

			{/* Player Create Modal */}
			<PlayerCreateModal
				isOpen={createModalOpen}
				onClose={() => {
					setCreateModalOpen(false);
				}}
				userid={user?.id || ""}
				onSuccess={handleEditSuccess}
			/>
		</div>
	);
}
