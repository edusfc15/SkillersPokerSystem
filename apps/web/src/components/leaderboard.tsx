import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@skillers/ui";
import { Gamepad2, TrendingUp, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsHttpService, type RankingEntry, type RankingFilter } from "../http/analytics.service";

type FilterLabel = "Último Jogo" | "Mês Atual" | "Ano Atual" | "Sempre";

const FILTER_MAP: Record<FilterLabel, RankingFilter> = {
  "Último Jogo": "LAST_GAME",
  "Mês Atual": "CURRENT_MONTH",
  "Ano Atual": "CURRENT_YEAR",
  "Sempre": "ALL_TIME",
};

const FILTER_LABELS: FilterLabel[] = ["Último Jogo", "Mês Atual", "Ano Atual", "Sempre"];

export function Leaderboard() {
  const [activeFilter, setActiveFilter] = useState<FilterLabel>("Sempre");
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsHttpService
      .getRanking(FILTER_MAP[activeFilter])
      .then((res) => setEntries(res.entries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  const formatProfit = (profit: number) => {
    const isPositive = profit >= 0;
    const sign = isPositive ? "+" : "";
    return (
      <span className={isPositive ? "text-green-500" : "text-red-500"}>
        {sign}R${Math.abs(profit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </span>
    );
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank.toString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Ranking de performance dos jogadores</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap space-x-1 bg-muted p-1 rounded-lg w-fit">
        {FILTER_LABELS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveFilter(label)}
            className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-colors ${
              activeFilter === label
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum dado disponível</div>
      ) : (
        <>
          {/* Top 3 */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topThree.map((player, index) => {
                const colors = [
                  "bg-gradient-to-br from-orange-500 to-red-600",
                  "bg-gradient-to-br from-blue-500 to-blue-700",
                  "bg-gradient-to-br from-orange-400 to-orange-600",
                ];
                return (
                  <Card key={player.playerId} className={`${colors[index]} text-white relative overflow-hidden`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{getRankIcon(player.rank)}</div>
                        <div className="text-right">
                          <div className="text-sm opacity-90">Lucro</div>
                          <div className="text-2xl font-bold">
                            R${Math.abs(player.totalProfit).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 border-2 border-white/20">
                          <AvatarFallback className="bg-white/20 text-white font-bold">
                            {getInitials(player.playerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-semibold">{player.playerName}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
                        <div>
                          <div className="text-xs opacity-75">Jogos</div>
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
          )}

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Rankings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-5 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
                    <div>Rank</div>
                    <div>Jogador</div>
                    <div className="flex items-center space-x-1"><Gamepad2 className="h-4 w-4" /><span>Jogos</span></div>
                    <div className="flex items-center space-x-1"><TrendingUp className="h-4 w-4" /><span>Lucro</span></div>
                    <div>Win Rate</div>
                  </div>
                  {rest.map((player) => (
                    <div key={player.playerId} className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/50 transition-colors border-b last:border-b-0">
                      <div className="font-medium">{player.rank}</div>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${player.playerName}&backgroundColor=EC681B`} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getInitials(player.playerName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{player.playerName}</span>
                      </div>
                      <div>{player.gamesPlayed}</div>
                      <div>{formatProfit(player.totalProfit)}</div>
                      <div>{player.winRate}%</div>
                    </div>
                  ))}
                </div>

                {/* Mobile */}
                <div className="md:hidden space-y-4 p-4">
                  {rest.map((player) => (
                    <div key={player.playerId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-orange-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">{player.rank}</div>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">{getInitials(player.playerName)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{player.playerName}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatProfit(player.totalProfit)}</div>
                          <div className="text-sm text-muted-foreground">{player.winRate}% win rate</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
