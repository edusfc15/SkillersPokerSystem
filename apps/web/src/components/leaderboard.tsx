import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@skillers/ui";
import { Gamepad2, TrendingUp, Trophy, User } from "lucide-react";
import { useState } from "react";

interface PlayerStats {
	id: string;
	rank: number;
	name: string;
	username: string;
	avatar?: string;
	gamesPlayed: number;
	profit: number;
	winRate: number;
	isCurrentUser?: boolean;
}

const mockData: PlayerStats[] = [
	{
		id: "1",
		rank: 1,
		name: "PokerKing",
		username: "David Chen",
		gamesPlayed: 56,
		profit: 5890,
		winRate: 67,
	},
	{
		id: "2",
		rank: 2,
		name: "JackAce",
		username: "Mike Johnson",
		gamesPlayed: 48,
		profit: 2450,
		winRate: 67,
	},
	{
		id: "3",
		rank: 3,
		name: "CardShark",
		username: "Sarah Williams",
		gamesPlayed: 42,
		profit: 1875,
		winRate: 59,
	},
	{
		id: "4",
		rank: 4,
		name: "RiverRunner",
		username: "Alex Tran",
		gamesPlayed: 38,
		profit: 1240,
		winRate: 54,
	},
	{
		id: "5",
		rank: 5,
		name: "BluffMaster",
		username: "James Wilson",
		gamesPlayed: 41,
		profit: 1120,
		winRate: 52,
	},
	{
		id: "6",
		rank: 6,
		name: "AceHigh",
		username: "Emma Roberts",
		gamesPlayed: 36,
		profit: 985,
		winRate: 48,
	},
	{
		id: "7",
		rank: 7,
		name: "FullHouse",
		username: "Ryan Kim",
		gamesPlayed: 33,
		profit: 820,
		winRate: 45,
	},
	{
		id: "8",
		rank: 8,
		name: "RoyalFlush",
		username: "Lisa Chang",
		gamesPlayed: 29,
		profit: 740,
		winRate: 41,
	},
	{
		id: "9",
		rank: 9,
		name: "PokerFace",
		username: "Mark Davis",
		gamesPlayed: 27,
		profit: 650,
		winRate: 39,
	},
	{
		id: "10",
		rank: 10,
		name: "DealerChoice",
		username: "Thomas Lee",
		gamesPlayed: 25,
		profit: 580,
		winRate: 36,
	},
];

const currentUserData: PlayerStats = {
	id: "user",
	rank: 38,
	name: "You",
	username: "Chris Parker",
	gamesPlayed: 15,
	profit: -120,
	winRate: 28,
	isCurrentUser: true,
};

type TimeFilter = "Sempre" | "Último Jogo" | "Último Mês" | "Mês Passado";

export function Leaderboard() {
	const [activeFilter, setActiveFilter] = useState<TimeFilter>("Sempre");

	const filters: TimeFilter[] = ["Último Jogo", "Último Mês", "Mês Passado", "Sempre"];

	const getTopThree = () => mockData.slice(0, 3);
	const getRestOfLeaderboard = () => mockData.slice(3);

	const getRankIcon = (rank: number) => {
		if (rank === 1) return "🥇";
		if (rank === 2) return "🥈";
		if (rank === 3) return "🥉";
		return rank.toString();
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

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
				<p className="text-muted-foreground">
					Track player performance and rankings across all poker games
				</p>
			</div>

			{/* Time Filter Tabs */}
			<div className="flex flex-wrap space-x-1 bg-muted p-1 rounded-lg w-fit">
				{filters.map((filter) => (
					<button
						key={filter}
						type="button"
						onClick={() => setActiveFilter(filter)}
						className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
							activeFilter === filter
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{filter}
					</button>
				))}
			</div>

			{/* Top 3 Players */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{getTopThree().map((player, index) => {
					const colors = [
						"bg-gradient-to-br from-orange-500 to-red-600",
						"bg-gradient-to-br from-blue-500 to-blue-700",
						"bg-gradient-to-br from-orange-500 to-red-600",
					];

					return (
						<Card
							key={player.id}
							className={`${colors[index]} text-white relative overflow-hidden`}
						>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<div className="text-2xl font-bold">{getRankIcon(player.rank)}</div>
									<div className="text-right">
										<div className="text-sm opacity-90">Profit</div>
										<div className="text-2xl font-bold">${player.profit.toLocaleString()}</div>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center space-x-3">
									<Avatar className="h-12 w-12 border-2 border-white/20">
										<AvatarImage
											src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.username}&backgroundColor=ffffff&textColor=000000`}
											alt={player.name}
										/>
										<AvatarFallback className="bg-white/20 text-white">
											{getUserInitials(player.username)}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-semibold">{player.name}</div>
										<div className="text-sm opacity-90">{player.username}</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
									<div>
										<div className="text-xs opacity-75">Games</div>
										<div className="font-semibold">{player.gamesPlayed}</div>
									</div>
									<div>
										<div className="text-xs opacity-75">Win Rate</div>
										<div className="font-semibold">{player.winRate}%</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Main Leaderboard Table */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-3">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<Trophy className="h-5 w-5" />
								<span>Rankings</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							{/* Desktop Table View */}
							<div className="hidden md:block space-y-0">
								{/* Header */}
								<div className="grid grid-cols-6 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
									<div>Rank</div>
									<div>Player</div>
									<div className="flex items-center space-x-1">
										<Gamepad2 className="h-4 w-4" />
										<span>Games</span>
									</div>
									<div className="flex items-center space-x-1">
										<TrendingUp className="h-4 w-4" />
										<span>Profit/Loss</span>
									</div>
									<div className="flex items-center space-x-1">
										<span>Win Rate</span>
									</div>
									<div></div>
								</div>

								{/* Rows */}
								{getRestOfLeaderboard().map((player) => (
									<div
										key={player.id}
										className="grid grid-cols-6 gap-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0"
									>
										<div className="font-medium">{player.rank}</div>
										<div className="flex items-center space-x-3">
											<Avatar className="h-8 w-8">
												<AvatarImage
													src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.username}&backgroundColor=EC681B`}
													alt={player.name}
												/>
												<AvatarFallback className="bg-primary text-primary-foreground text-xs">
													{getUserInitials(player.username)}
												</AvatarFallback>
											</Avatar>
											<div>
												<div className="font-medium text-sm">{player.name}</div>
												<div className="text-xs text-muted-foreground">{player.username}</div>
											</div>
										</div>
										<div className="font-medium">{player.gamesPlayed}</div>
										<div>{formatProfit(player.profit)}</div>
										<div className="font-medium">{player.winRate}%</div>
										<div></div>
									</div>
								))}
							</div>

							{/* Mobile Card View */}
							<div className="md:hidden space-y-4 p-4">
								{getRestOfLeaderboard().map((player) => (
									<div key={player.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
										{/* Player Header */}
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<div className="bg-orange-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
													{player.rank}
												</div>
												<Avatar className="h-10 w-10">
													<AvatarImage
														src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.username}&backgroundColor=EC681B`}
														alt={player.name}
													/>
													<AvatarFallback className="bg-primary text-primary-foreground text-sm">
														{getUserInitials(player.username)}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">{player.name}</div>
													<div className="text-sm text-muted-foreground">{player.username}</div>
												</div>
											</div>
											<div className="text-right">
												<div className="font-bold">{formatProfit(player.profit)}</div>
												<div className="text-sm text-muted-foreground">{player.winRate}% win rate</div>
											</div>
										</div>

										{/* Player Stats */}
										<div className="flex justify-between text-sm pt-2 border-t">
											<div className="flex items-center space-x-1">
												<Gamepad2 className="h-4 w-4 text-muted-foreground" />
												<span className="text-muted-foreground">Games:</span>
												<span className="font-medium">{player.gamesPlayed}</span>
											</div>
										</div>
									</div>
								))}
							</div>

							<div className="p-4 border-t">
								<button
									type="button"
									className="w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium transition-colors"
								>
									Load More
								</button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* User Position Card */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<User className="h-5 w-5" />
								<span>Your Position</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-center">
								<div className="text-3xl font-bold text-muted-foreground mb-1">
									{currentUserData.rank}
								</div>
							</div>

							<div className="flex items-center space-x-3">
								<Avatar className="h-12 w-12">
									<AvatarImage
										src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUserData.username}&backgroundColor=EC681B`}
										alt={currentUserData.name}
									/>
									<AvatarFallback className="bg-primary text-primary-foreground">
										{getUserInitials(currentUserData.username)}
									</AvatarFallback>
								</Avatar>
								<div>
									<div className="font-semibold">{currentUserData.name}</div>
									<div className="text-sm text-muted-foreground">{currentUserData.username}</div>
								</div>
							</div>

							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Total Profit</span>
									<span className="font-semibold">{formatProfit(currentUserData.profit)}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Games Played</span>
									<span className="font-semibold">{currentUserData.gamesPlayed}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-muted-foreground">Win Rate</span>
									<span className="font-semibold">{currentUserData.winRate}%</span>
								</div>
							</div>

							<div className="pt-4 border-t">
								<div className="text-xs text-muted-foreground mb-2">To reach top 10:</div>
								<div className="text-sm font-medium">Need +$700 more profit</div>
							</div>

							<button
								type="button"
								className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium transition-colors"
							>
								🎮 Join Next Game
							</button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
