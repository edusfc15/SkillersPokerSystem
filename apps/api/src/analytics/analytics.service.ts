// apps/api/src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export type RankingFilter = 'LAST_GAME' | 'CURRENT_MONTH' | 'CURRENT_YEAR' | 'ALL_TIME';

export interface RankingEntry {
  rank: number;
  playerId: string;
  playerName: string;
  gamesPlayed: number;
  gamesWithProfit: number;
  winRate: number;
  totalProfit: number;
}

export interface MonthlyRankingEntry {
  rank: number;
  playerId: string;
  playerName: string;
  monthly: Record<number, number>;
  yearTotal: number;
  gamesPlayed: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private getDateFilterForPeriod(filter: RankingFilter): { gte?: Date; lte?: Date } | undefined {
    const now = new Date();
    if (filter === 'CURRENT_MONTH') {
      return {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
      };
    }
    if (filter === 'CURRENT_YEAR') {
      return {
        gte: new Date(now.getFullYear(), 0, 1),
        lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
      };
    }
    return undefined;
  }

  async getRanking(filter: RankingFilter): Promise<{ filter: string; entries: RankingEntry[] }> {
    let gameIdFilter: bigint | undefined;
    if (filter === 'LAST_GAME') {
      const lastGame = await this.prisma.games.findFirst({
        where: { status: 'Encerrado' },
        orderBy: { createddate: 'desc' },
        select: { id: true },
      });
      if (!lastGame) return { filter, entries: [] };
      gameIdFilter = lastGame.id;
    }

    const dateFilter = this.getDateFilterForPeriod(filter);

    const details = await this.prisma.gamedetails.findMany({
      where: {
        playerid: { not: BigInt(0) },
        games: {
          status: 'Encerrado',
          ...(gameIdFilter ? { id: gameIdFilter } : {}),
          ...(dateFilter ? { createddate: dateFilter } : {}),
        },
      },
      select: {
        playerid: true,
        value: true,
        chipstotal: true,
        gameid: true,
        players: { select: { name: true } },
      },
    });

    const byPlayerGame = new Map<string, { playerName: string; profitPerGame: Map<string, number> }>();

    for (const d of details) {
      const pid = d.playerid.toString();
      const gid = d.gameid.toString();
      if (!byPlayerGame.has(pid)) {
        byPlayerGame.set(pid, { playerName: d.players.name, profitPerGame: new Map() });
      }
      const entry = byPlayerGame.get(pid)!;
      const current = entry.profitPerGame.get(gid) ?? 0;
      entry.profitPerGame.set(gid, current + (Number(d.chipstotal) - Number(d.value)));
    }

    const entries: RankingEntry[] = [];
    for (const [playerId, { playerName, profitPerGame }] of byPlayerGame) {
      const profits = Array.from(profitPerGame.values());
      const totalProfit = profits.reduce((s, p) => s + p, 0);
      const gamesWithProfit = profits.filter((p) => p > 0).length;
      entries.push({
        rank: 0,
        playerId,
        playerName,
        gamesPlayed: profits.length,
        gamesWithProfit,
        winRate: profits.length > 0 ? Math.round((gamesWithProfit / profits.length) * 100) : 0,
        totalProfit: Math.round(totalProfit * 100) / 100,
      });
    }

    entries.sort((a, b) => b.totalProfit - a.totalProfit);
    entries.forEach((e, i) => { e.rank = i + 1; });

    return { filter, entries };
  }

  async getMonthlyRanking(year: number): Promise<MonthlyRankingEntry[]> {
    const details = await this.prisma.gamedetails.findMany({
      where: {
        playerid: { not: BigInt(0) },
        games: {
          status: 'Encerrado',
          createddate: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31, 23, 59, 59),
          },
        },
      },
      select: {
        playerid: true,
        value: true,
        chipstotal: true,
        gameid: true,
        players: { select: { name: true } },
        games: { select: { createddate: true } },
      },
    });

    const byPlayerGame = new Map<string, { playerName: string; gameData: Map<string, { month: number; profit: number }> }>();

    for (const d of details) {
      const pid = d.playerid.toString();
      const gid = d.gameid.toString();
      if (!byPlayerGame.has(pid)) {
        byPlayerGame.set(pid, { playerName: d.players.name, gameData: new Map() });
      }
      const entry = byPlayerGame.get(pid)!;
      if (!entry.gameData.has(gid)) {
        entry.gameData.set(gid, { month: d.games.createddate.getMonth() + 1, profit: 0 });
      }
      const gameEntry = entry.gameData.get(gid)!;
      gameEntry.profit += Number(d.chipstotal) - Number(d.value);
    }

    const result: MonthlyRankingEntry[] = [];
    for (const [playerId, { playerName, gameData }] of byPlayerGame) {
      const monthly: Record<number, number> = {};
      let yearTotal = 0;
      let gamesPlayed = 0;

      for (const { month, profit } of gameData.values()) {
        monthly[month] = (monthly[month] ?? 0) + Math.round(profit * 100) / 100;
        yearTotal += profit;
        gamesPlayed++;
      }

      result.push({
        rank: 0,
        playerId,
        playerName,
        monthly,
        yearTotal: Math.round(yearTotal * 100) / 100,
        gamesPlayed,
      });
    }

    result.sort((a, b) => b.yearTotal - a.yearTotal);
    result.forEach((e, i) => { e.rank = i + 1; });

    return result;
  }

  async getAvailableYears(): Promise<{ years: number[] }> {
    const games = await this.prisma.games.findMany({
      where: { status: 'Encerrado' },
      select: { createddate: true },
    });
    const years = [...new Set(games.map((g) => g.createddate.getFullYear()))].sort((a, b) => b - a);
    return { years };
  }
}
