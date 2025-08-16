import { Avatar, AvatarFallback, AvatarImage, Card, CardContent } from "@skillers/ui";
import {
	ChevronLeft,
	ChevronRight,
	DollarSign,
	Edit,
	Eye,
	Filter,
	Gamepad2,
	MoreVertical,
	Play,
	Plus,
	Search,
	Trophy,
	Users,
} from "lucide-react";
import { useState } from "react";

interface Game {
	id: string;
	name: string;
	type: "Cash Game" | "Tournament" | "Sit & Go" | "Freeroll";
	status: "Active" | "Completed" | "Scheduled" | "Cancelled";
	startTime: string;
	endTime?: string;
	players: GamePlayer[];
	maxPlayers: number;
	buyIn: number;
	prizePool: number;
	blindStructure: string;
	duration?: string;
	winner?: string;
}

interface GamePlayer {
	id: string;
	name: string;
	email: string;
	position?: number;
	earnings: number;
	joinTime: string;
	status: "Playing" | "Eliminated" | "Left" | "Waiting";
}

const mockGames: Game[] = [
	{
		id: "1",
		name: "High Stakes Cash Game",
		type: "Cash Game",
		status: "Active",
		startTime: "2025-08-05 20:00",
		players: [
			{
				id: "1",
				name: "PokerKing",
				email: "david.chen@email.com",
				earnings: 1250,
				joinTime: "20:00",
				status: "Playing",
			},
			{
				id: "2",
				name: "JackAce",
				email: "mike.johnson@email.com",
				earnings: -450,
				joinTime: "20:15",
				status: "Playing",
			},
			{
				id: "3",
				name: "CardShark",
				email: "sarah.williams@email.com",
				earnings: 890,
				joinTime: "20:30",
				status: "Playing",
			},
		],
		maxPlayers: 9,
		buyIn: 1000,
		prizePool: 8500,
		blindStructure: "25/50",
	},
	{
		id: "2",
		name: "Sunday Tournament",
		type: "Tournament",
		status: "Completed",
		startTime: "2025-08-04 18:00",
		endTime: "2025-08-04 23:45",
		duration: "5h 45m",
		players: [
			{
				id: "4",
				name: "RiverRunner",
				email: "alex.tran@email.com",
				position: 1,
				earnings: 2500,
				joinTime: "18:00",
				status: "Eliminated",
			},
			{
				id: "5",
				name: "BluffMaster",
				email: "james.wilson@email.com",
				position: 2,
				earnings: 1500,
				joinTime: "18:00",
				status: "Eliminated",
			},
			{
				id: "1",
				name: "PokerKing",
				email: "david.chen@email.com",
				position: 3,
				earnings: 750,
				joinTime: "18:00",
				status: "Eliminated",
			},
		],
		maxPlayers: 50,
		buyIn: 100,
		prizePool: 4500,
		blindStructure: "Progressive",
		winner: "RiverRunner",
	},
	{
		id: "3",
		name: "Beginner Friendly",
		type: "Sit & Go",
		status: "Scheduled",
		startTime: "2025-08-05 22:00",
		players: [
			{
				id: "6",
				name: "NewPlayer",
				email: "new.player@email.com",
				earnings: 0,
				joinTime: "21:45",
				status: "Waiting",
			},
		],
		maxPlayers: 6,
		buyIn: 25,
		prizePool: 135,
		blindStructure: "10/20",
	},
	{
		id: "4",
		name: "Friday Freeroll",
		type: "Freeroll",
		status: "Active",
		startTime: "2025-08-05 19:00",
		players: [
			{
				id: "2",
				name: "JackAce",
				email: "mike.johnson@email.com",
				earnings: 0,
				joinTime: "19:00",
				status: "Playing",
			},
			{
				id: "7",
				name: "LuckyPlayer",
				email: "lucky@email.com",
				earnings: 0,
				joinTime: "19:10",
				status: "Playing",
			},
		],
		maxPlayers: 100,
		buyIn: 0,
		prizePool: 500,
		blindStructure: "5/10",
	},
];

type GameFilter = "All Games" | "Active" | "Completed" | "Scheduled";
type GameTypeFilter = "All Types" | "Cash Game" | "Tournament" | "Sit & Go" | "Freeroll";
type SortOption = "Start Time" | "Prize Pool" | "Players" | "Buy-in";

export function GamesManagement() {
	const [selectedFilter, setSelectedFilter] = useState<GameFilter>("All Games");
	const [selectedType, setSelectedType] = useState<GameTypeFilter>("All Types");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("Start Time");
	const [selectedGames, setSelectedGames] = useState<string[]>([]);

	const filters: GameFilter[] = ["All Games", "Active", "Completed", "Scheduled"];
	const gameTypes: GameTypeFilter[] = ["All Types", "Cash Game", "Tournament", "Sit & Go", "Freeroll"];

	const getFilteredGames = () => {
		let filtered = mockGames;

		// Filter by status
		if (selectedFilter !== "All Games") {
			filtered = filtered.filter((game) => game.status === selectedFilter);
		}

		// Filter by type
		if (selectedType !== "All Types") {
			filtered = filtered.filter((game) => game.type === selectedType);
		}

		// Filter by search
		if (searchQuery) {
			filtered = filtered.filter((game) =>
				game.name.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		return filtered;
	};

	const getStats = () => {
		const totalGames = mockGames.length;
		const activeGames = mockGames.filter((g) => g.status === "Active").length;
		const completedToday = mockGames.filter((g) => 
			g.status === "Completed" && g.endTime?.includes("2025-08-05")
		).length;
		const totalPrizePool = mockGames.reduce((sum, game) => sum + game.prizePool, 0);

		return {
			total: totalGames,
			active: activeGames,
			completedToday,
			totalPrizePool,
		};
	};

	const stats = getStats();
	const filteredGames = getFilteredGames();

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "Active":
				return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
			case "Completed":
				return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
			case "Scheduled":
				return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
			case "Cancelled":
				return <div className="w-2 h-2 bg-red-500 rounded-full" />;
			default:
				return null;
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "Cash Game":
				return <DollarSign className="w-4 h-4 text-green-500" />;
			case "Tournament":
				return <Trophy className="w-4 h-4 text-yellow-500" />;
			case "Sit & Go":
				return <Users className="w-4 h-4 text-blue-500" />;
			case "Freeroll":
				return <Play className="w-4 h-4 text-purple-500" />;
			default:
				return <Gamepad2 className="w-4 h-4" />;
		}
	};

	const formatCurrency = (amount: number) => {
		if (amount === 0) return "Free";
		return `$${amount.toLocaleString()}`;
	};

	const formatEarnings = (earnings: number) => {
		const isPositive = earnings >= 0;
		const sign = isPositive ? "+" : "";
		return (
			<span className={isPositive ? "text-green-500" : "text-red-500"}>
				{sign}${Math.abs(earnings).toLocaleString()}
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

	const toggleGameSelection = (gameId: string) => {
		setSelectedGames((prev) =>
			prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId],
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
					<h1 className="text-3xl font-bold mb-2">Games Management</h1>
					<p className="text-muted-foreground">
						Monitor and manage poker games, tournaments, and cash tables
					</p>
				</div>
				<button
					type="button"
					className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
				>
					<Plus className="w-4 h-4" />
					<span>Create Game</span>
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<Gamepad2 className="w-5 h-5 text-orange-500" />
							<div>
								<div className="text-2xl font-bold">{stats.total}</div>
								<div className="text-sm text-muted-foreground">Total Games</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<Play className="w-5 h-5 text-green-500" />
							<div>
								<div className="text-2xl font-bold">{stats.active}</div>
								<div className="text-sm text-muted-foreground">Active Games</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<Trophy className="w-5 h-5 text-blue-500" />
							<div>
								<div className="text-2xl font-bold">{stats.completedToday}</div>
								<div className="text-sm text-muted-foreground">Completed Today</div>
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
								<div className="text-sm text-muted-foreground">Total Prize Pool</div>
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
								{filter}
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
									placeholder="Search games..."
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
							<select
								value={selectedType}
								onChange={(e) => setSelectedType(e.target.value as GameTypeFilter)}
								className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
							>
								{gameTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
							<div className="flex items-center space-x-2">
								<span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value as SortOption)}
									className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
								>
									<option value="Start Time">Start Time</option>
									<option value="Prize Pool">Prize Pool</option>
									<option value="Players">Players</option>
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
					{/* Desktop Table View */}
					<div className="hidden lg:block space-y-0">
						{/* Table Header */}
						<div className="grid grid-cols-9 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={
										selectedGames.length === filteredGames.length && filteredGames.length > 0
									}
									onChange={toggleSelectAll}
									className="rounded border-gray-300"
								/>
							</div>
							<div>Game</div>
							<div>Type</div>
							<div>Status</div>
							<div>Players</div>
							<div>Buy-in</div>
							<div>Prize Pool</div>
							<div>Time</div>
							<div>Actions</div>
						</div>

						{/* Table Rows */}
						{filteredGames.map((game) => (
							<div
								key={game.id}
								className="grid grid-cols-9 gap-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
							>
								<div className="flex items-center">
									<input
										type="checkbox"
										checked={selectedGames.includes(game.id)}
										onChange={() => toggleGameSelection(game.id)}
										className="rounded border-gray-300"
									/>
								</div>

								<div>
									<div className="font-medium text-sm">{game.name}</div>
									<div className="text-xs text-muted-foreground">{game.blindStructure}</div>
								</div>

								<div className="flex items-center space-x-2">
									{getTypeIcon(game.type)}
									<span className="text-sm">{game.type}</span>
								</div>

								<div className="flex items-center space-x-2">
									{getStatusIcon(game.status)}
									<span className="text-sm">{game.status}</span>
								</div>

								<div className="text-sm">
									{game.players.length}/{game.maxPlayers}
								</div>

								<div className="text-sm font-medium">{formatCurrency(game.buyIn)}</div>
								<div className="text-sm font-medium">{formatCurrency(game.prizePool)}</div>

								<div className="text-sm">
									<div>{game.startTime.split(" ")[1]}</div>
									{game.duration && (
										<div className="text-xs text-muted-foreground">{game.duration}</div>
									)}
								</div>

								<div className="flex items-center space-x-1">
									<button
										type="button"
										className="p-1 hover:bg-accent rounded transition-colors"
										title="View Details"
									>
										<Eye className="w-4 h-4" />
									</button>
									<button
										type="button"
										className="p-1 hover:bg-accent rounded transition-colors"
										title="Edit Game"
									>
										<Edit className="w-4 h-4" />
									</button>
									<button
										type="button"
										className="p-1 hover:bg-accent rounded transition-colors"
										title="More Options"
									>
										<MoreVertical className="w-4 h-4" />
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
									? "Deselect All"
									: "Select All"}
							</button>
							<span className="text-sm text-muted-foreground">
								{selectedGames.length} of {filteredGames.length} selected
							</span>
						</div>

						{/* Mobile Game Cards */}
						{filteredGames.map((game) => (
							<div
								key={game.id}
								className={`border rounded-lg p-4 space-y-3 transition-all duration-200 ${
									selectedGames.includes(game.id)
										? "border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-sm"
										: "border-border hover:border-orange-200 hover:shadow-sm"
								}`}
							>
								{/* Game Header */}
								<div className="flex items-start justify-between">
									<div className="flex items-center space-x-3 flex-1 min-w-0">
										<input
											type="checkbox"
											checked={selectedGames.includes(game.id)}
											onChange={() => toggleGameSelection(game.id)}
											className="rounded border-gray-300 mt-1"
										/>
										<div className="flex-1 min-w-0">
											<div className="font-semibold text-base truncate">{game.name}</div>
											<div className="flex items-center space-x-2 mt-1">
												{getTypeIcon(game.type)}
												<span className="text-sm font-medium">{game.type}</span>
											</div>
										</div>
									</div>
									<div className="flex items-center space-x-2 flex-shrink-0">
										{getStatusIcon(game.status)}
										<span className="text-sm font-medium">{game.status}</span>
									</div>
								</div>

								{/* Game Stats Grid */}
								<div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 rounded-lg p-3">
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Players</span>
										<div className="font-semibold">
											{game.players.length}/{game.maxPlayers}
										</div>
									</div>
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Buy-in</span>
										<div className="font-semibold">{formatCurrency(game.buyIn)}</div>
									</div>
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Prize Pool</span>
										<div className="font-semibold">{formatCurrency(game.prizePool)}</div>
									</div>
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Start Time</span>
										<div className="font-medium text-xs">{game.startTime.split(" ")[1]}</div>
									</div>
								</div>

								{/* Players List */}
								{game.players.length > 0 && (
									<div className="space-y-2">
										<span className="text-xs text-muted-foreground">Players:</span>
										<div className="flex flex-wrap gap-2">
											{game.players.slice(0, 3).map((player) => (
												<div
													key={player.id}
													className="flex items-center space-x-2 bg-background rounded-md p-2 border"
												>
													<Avatar className="h-6 w-6">
														<AvatarImage
															src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.email}&backgroundColor=EC681B`}
															alt={player.name}
														/>
														<AvatarFallback className="bg-primary text-primary-foreground text-xs">
															{getUserInitials(player.name)}
														</AvatarFallback>
													</Avatar>
													<span className="text-xs font-medium">{player.name}</span>
													{player.earnings !== 0 && (
														<span className="text-xs">
															{formatEarnings(player.earnings)}
														</span>
													)}
												</div>
											))}
											{game.players.length > 3 && (
												<div className="flex items-center justify-center bg-muted rounded-md p-2 border text-xs text-muted-foreground">
													+{game.players.length - 3} more
												</div>
											)}
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex items-center justify-between pt-3 border-t border-border/50">
									<div className="flex items-center space-x-1">
										<button
											type="button"
											className="p-2 hover:bg-accent rounded-md transition-colors"
											title="View Details"
										>
											<Eye className="w-4 h-4" />
										</button>
										<button
											type="button"
											className="p-2 hover:bg-accent rounded-md transition-colors"
											title="Edit Game"
										>
											<Edit className="w-4 h-4" />
										</button>
									</div>
									<button
										type="button"
										className="p-2 hover:bg-accent rounded-md transition-colors"
										title="More Options"
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
							Showing 1-{filteredGames.length} of {filteredGames.length} games
						</div>
						<div className="flex items-center space-x-2">
							<button
								type="button"
								className="p-2 border border-input bg-background hover:bg-accent rounded-md transition-colors disabled:opacity-50"
								disabled
							>
								<ChevronLeft className="w-4 h-4" />
							</button>

							<div className="flex space-x-1">
								<button
									type="button"
									className="px-3 py-1 text-sm rounded-md transition-colors bg-orange-500 text-white"
								>
									1
								</button>
							</div>

							<button
								type="button"
								className="p-2 border border-input bg-background hover:bg-accent rounded-md transition-colors disabled:opacity-50"
								disabled
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
							{selectedGames.length} selected
						</span>
						<div className="grid grid-cols-2 md:flex md:items-center gap-2 md:space-x-2">
							<button
								type="button"
								className="px-3 py-2 text-sm border border-input bg-background hover:bg-accent rounded-md transition-colors flex items-center justify-center space-x-1"
							>
								<span>Export</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm border border-input bg-background hover:bg-accent rounded-md transition-colors flex items-center justify-center space-x-1"
							>
								<span>Cancel</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center justify-center space-x-1 col-span-2 md:col-span-1"
							>
								<span>Manage Selected</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
