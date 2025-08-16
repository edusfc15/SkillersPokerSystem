import { Avatar, AvatarFallback, AvatarImage, Card, CardContent } from "@skillers/ui";
import {
	ChevronLeft,
	ChevronRight,
	Crown,
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
import { useState } from "react";

interface Player {
	id: string;
	name: string;
	email: string;
	status: "Active" | "VIP" | "Suspended" | "Inactive";
	registrationDate: string;
	lastActivity: string;
	totalProfit: number;
	gamesPlayed: number;
	avatar?: string;
	selected?: boolean;
}

const mockPlayers: Player[] = [
	{
		id: "1",
		name: "PokerKing",
		email: "david.chen@email.com",
		status: "Active",
		registrationDate: "Jan 15, 2025",
		lastActivity: "2 hours ago",
		totalProfit: 5890,
		gamesPlayed: 56,
	},
	{
		id: "2",
		name: "JackAce",
		email: "mike.johnson@email.com",
		status: "VIP",
		registrationDate: "Dec 3, 2024",
		lastActivity: "1 day ago",
		totalProfit: 2450,
		gamesPlayed: 48,
	},
	{
		id: "3",
		name: "CardShark",
		email: "sarah.williams@email.com",
		status: "Active",
		registrationDate: "Nov 20, 2024",
		lastActivity: "5 hours ago",
		totalProfit: 1875,
		gamesPlayed: 42,
	},
	{
		id: "4",
		name: "RiverRunner",
		email: "alex.tran@email.com",
		status: "Suspended",
		registrationDate: "Oct 12, 2024",
		lastActivity: "3 days ago",
		totalProfit: -340,
		gamesPlayed: 38,
	},
	{
		id: "5",
		name: "BluffMaster",
		email: "james.wilson@email.com",
		status: "Inactive",
		registrationDate: "Sep 8, 2024",
		lastActivity: "2 weeks ago",
		totalProfit: 1120,
		gamesPlayed: 41,
	},
];

type TabFilter = "All Players" | "Active" | "VIP" | "Suspended";
type SortOption = "Registration Date" | "Last Activity" | "Total Profit" | "Games Played";

export function PlayersManagement() {
	const [selectedTab, setSelectedTab] = useState<TabFilter>("All Players");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("Registration Date");
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(1);

	const tabs: TabFilter[] = ["All Players", "Active", "VIP", "Suspended"];

	const getFilteredPlayers = () => {
		let filtered = mockPlayers;

		// Filter by tab
		if (selectedTab !== "All Players") {
			filtered = filtered.filter((player) => player.status === selectedTab);
		}

		// Filter by search
		if (searchQuery) {
			filtered = filtered.filter(
				(player) =>
					player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					player.email.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		return filtered;
	};

	const getStats = () => {
		const totalPlayers = mockPlayers.length;
		const vipCount = mockPlayers.filter((p) => p.status === "VIP").length;
		const suspendedCount = mockPlayers.filter((p) => p.status === "Suspended").length;
		const newToday = mockPlayers.filter((p) => p.registrationDate.includes("2025")).length;

		return {
			total: totalPlayers,
			newToday,
			vip: vipCount,
			suspended: suspendedCount,
		};
	};

	const stats = getStats();
	const filteredPlayers = getFilteredPlayers();

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "Active":
				return <div className="w-2 h-2 bg-green-500 rounded-full" />;
			case "VIP":
				return <Crown className="w-4 h-4 text-yellow-500" />;
			case "Suspended":
				return <div className="w-2 h-2 bg-red-500 rounded-full" />;
			case "Inactive":
				return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
			default:
				return null;
		}
	};

	const formatProfit = (profit: number) => {
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
					<h1 className="text-3xl font-bold mb-2">Players Management</h1>
					<p className="text-muted-foreground">
						Manage player accounts, permissions, and game access
					</p>
				</div>
				<button
					type="button"
					className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
				>
					<UserPlus className="w-4 h-4" />
					<span>Add Player</span>
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<Users className="w-5 h-5 text-orange-500" />
							<div>
								<div className="text-2xl font-bold">{stats.total}</div>
								<div className="text-sm text-muted-foreground">Active Players</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<UserPlus className="w-5 h-5 text-blue-500" />
							<div>
								<div className="text-2xl font-bold">{stats.newToday}</div>
								<div className="text-sm text-muted-foreground">New Registrations</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<Crown className="w-5 h-5 text-yellow-500" />
							<div>
								<div className="text-2xl font-bold">{stats.vip}</div>
								<div className="text-sm text-muted-foreground">Premium Members</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-4 md:p-6">
						<div className="flex items-center space-x-2">
							<UserX className="w-5 h-5 text-red-500" />
							<div>
								<div className="text-2xl font-bold">{stats.suspended}</div>
								<div className="text-sm text-muted-foreground">Suspended Accounts</div>
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
									placeholder="Search players..."
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
							<span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as SortOption)}
								className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring flex-1 md:flex-none"
							>
								<option value="Registration Date">Registration Date</option>
								<option value="Last Activity">Last Activity</option>
								<option value="Total Profit">Total Profit</option>
								<option value="Games Played">Games Played</option>
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
										selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0
									}
									onChange={toggleSelectAll}
									className="rounded border-gray-300"
								/>
							</div>
							<div>Player</div>
							<div>Status</div>
							<div>Registration</div>
							<div>Last Activity</div>
							<div>Total Profit</div>
							<div>Games Played</div>
							<div>Actions</div>
						</div>

						{/* Table Rows */}
						{filteredPlayers.map((player) => (
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
											src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.email}&backgroundColor=EC681B`}
											alt={player.name}
										/>
										<AvatarFallback className="bg-primary text-primary-foreground text-xs">
											{getUserInitials(player.name)}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium text-sm">{player.name}</div>
										<div className="text-xs text-muted-foreground">{player.email}</div>
									</div>
								</div>

								<div className="flex items-center space-x-2">
									{getStatusIcon(player.status)}
									<span className="text-sm">{player.status}</span>
								</div>

								<div className="text-sm">{player.registrationDate}</div>
								<div className="text-sm">{player.lastActivity}</div>
								<div>{formatProfit(player.totalProfit)}</div>
								<div className="font-medium">{player.gamesPlayed}</div>

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
										title="Edit Player"
									>
										<Edit className="w-4 h-4" />
									</button>
									<button
										type="button"
										className="p-1 hover:bg-accent rounded transition-colors"
										title="Reset Password"
									>
										<RotateCcw className="w-4 h-4" />
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
					<div className="md:hidden space-y-3 p-4">
						{/* Select All Button for Mobile */}
						<div className="flex items-center justify-between pb-2">
							<button
								type="button"
								onClick={toggleSelectAll}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								{selectedPlayers.length === filteredPlayers.length && filteredPlayers.length > 0
									? "Deselect All"
									: "Select All"}
							</button>
							<span className="text-sm text-muted-foreground">
								{selectedPlayers.length} of {filteredPlayers.length} selected
							</span>
						</div>

						{/* Mobile Player Cards */}
						{filteredPlayers.map((player) => (
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
												src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.email}&backgroundColor=EC681B`}
												alt={player.name}
											/>
											<AvatarFallback className="bg-primary text-primary-foreground text-sm">
												{getUserInitials(player.name)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<div className="font-semibold text-base truncate">{player.name}</div>
											<div className="text-sm text-muted-foreground truncate">{player.email}</div>
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
										<span className="text-muted-foreground text-xs">Total Profit</span>
										<div className="font-semibold">{formatProfit(player.totalProfit)}</div>
									</div>
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Games Played</span>
										<div className="font-semibold">{player.gamesPlayed}</div>
									</div>
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Registration</span>
										<div className="font-medium text-xs">{player.registrationDate}</div>
									</div>
									<div className="space-y-1">
										<span className="text-muted-foreground text-xs">Last Activity</span>
										<div className="font-medium text-xs">{player.lastActivity}</div>
									</div>
								</div>

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
											title="Edit Player"
										>
											<Edit className="w-4 h-4" />
										</button>
										<button
											type="button"
											className="p-2 hover:bg-accent rounded-md transition-colors"
											title="Reset Password"
										>
											<RotateCcw className="w-4 h-4" />
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
							Showing 1-5 of {filteredPlayers.length} players
						</div>
						<div className="flex items-center space-x-2">
							<button
								type="button"
								className="p-2 border border-input bg-background hover:bg-accent rounded-md transition-colors disabled:opacity-50"
								disabled={currentPage === 1}
							>
								<ChevronLeft className="w-4 h-4" />
							</button>

							<div className="flex space-x-1">
								{[1, 2, 3].map((page) => (
									<button
										key={page}
										type="button"
										onClick={() => setCurrentPage(page)}
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
								className="p-2 border border-input bg-background hover:bg-accent rounded-md transition-colors"
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
							{selectedPlayers.length} selected
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
								<span>Suspend</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm border border-input bg-background hover:bg-accent rounded-md transition-colors flex items-center justify-center space-x-1"
							>
								<span>Activate</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center justify-center space-x-1"
							>
								<span>Bonus</span>
							</button>
							<button
								type="button"
								className="px-3 py-2 text-sm border border-input bg-background hover:bg-accent rounded-md transition-colors flex items-center justify-center space-x-1 col-span-2 md:col-span-1"
							>
								<span>Notify</span>
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
