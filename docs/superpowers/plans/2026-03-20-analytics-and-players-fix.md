# Analytics & Players Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken `isadmin` call sites in Players API and implement the Analytics module (ranking endpoint + leaderboard + RankingPage) with real data.

**Architecture:** Backend: new `AnalyticsModule` in NestJS following the existing `GamesModule` pattern, querying `gamedetails` joined to `games` and `players`, filtering `playerid != 0` (Capile/rake) and `status = 'Encerrado'`. Frontend: replace mocked `Leaderboard` component with real data from `GET /analytics/ranking`, add new `RankingPage` with monthly Jan-Dez table.

**Tech Stack:** NestJS 10, Prisma 6, PostgreSQL, React 19, ky (HTTP client), ShadCN/UI, Tailwind CSS, Jest (unit tests)

**Spec:** `docs/superpowers/specs/2026-03-20-skillers-continuation-design.md`

---

## File Map

### Backend — Modified
- `apps/api/src/app.controller.ts` — fix 7 broken `players.isadmin` call sites → use `users.isadmin`
- `apps/api/src/app.module.ts` — register `AnalyticsModule`
- `apps/api/src/games/games.service.ts` — fix `finishGame()` to store `'Encerrado'`, simplify `normalizeGameStatus()`

### Backend — Created
- `apps/api/src/analytics/analytics.module.ts`
- `apps/api/src/analytics/analytics.controller.ts`
- `apps/api/src/analytics/analytics.service.ts`
- `apps/api/src/analytics/analytics.service.spec.ts`

### Frontend — Modified
- `apps/web/src/components/leaderboard.tsx` — replace mock with real API data
- `apps/web/src/router/index.tsx` — add `/app/ranking` route
- `apps/web/src/components/header.tsx` — add "Ranking" nav link
- `apps/web/src/http/index.ts` — export new analytics service

### Frontend — Created
- `apps/web/src/http/analytics.service.ts` — HTTP client for analytics endpoints
- `apps/web/src/pages/RankingPage.tsx` — full Jan-Dez monthly table

---

## Task 1: Fix `isadmin` in `app.controller.ts`

**Context:** The `players` Prisma model has no `isadmin` field. All 7 call sites that read/write `isadmin` on `players` will crash at runtime. The correct field is `users.isadmin`.

**Files:**
- Modify: `apps/api/src/app.controller.ts`

- [ ] **Step 1: Fix `isPlayerAdmin()` (line ~34)**

Replace the private method:
```typescript
private async isPlayerAdmin(userId: string): Promise<boolean> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { isadmin: true },
  });
  return user?.isadmin ?? false;
}
```

- [ ] **Step 2: Fix `getActivePlayers()` (line ~62) — remove `isadmin` from select**

In the `select` block inside `prisma.player.findMany`, remove `isadmin: true`. Add it to the mapped response by fetching from the `users` relation OR simply omit it from this endpoint (it's not needed for the players list UI).

The simplest fix: remove `isadmin: true` from the `select` and keep the returned `isadmin` field by joining via `users`:
```typescript
// In the select block, add:
users: {
  select: { isadmin: true },
},
```
Then in the `map`:
```typescript
isadmin: player.users?.isadmin ?? false,
```

- [ ] **Step 3: Fix `getPlayerDetails()` (line ~111) — same pattern**

Same as Step 2: replace `isadmin: true` in select with `users: { select: { isadmin: true } }`, then add `isadmin: player.users?.isadmin ?? false` to the returned object.

- [ ] **Step 4: Fix `getAdminPlayers()` (line ~249) — query `users` instead of `players`**

Replace the entire query to fetch from `users` table:
```typescript
const adminUsers = await this.prisma.user.findMany({
  where: { isadmin: true },
  select: {
    id: true,
    username: true,
    displayname: true,
    isadmin: true,
    players: {
      select: {
        id: true,
        name: true,
        imageurl: true,
      },
      take: 1,
    },
  },
});

return {
  success: true,
  data: adminUsers.map((u) => ({
    userId: u.id,
    username: u.username,
    displayname: u.displayname,
    isadmin: u.isadmin,
    player: u.players[0] ?? null,
  })),
};
```

- [ ] **Step 5: Fix `associateUserToPlayer()` (line ~274) — remove `isadmin` from update select**

In the `prisma.player.update` select block, replace `isadmin: true` with `users: { select: { isadmin: true } }`. Add `isadmin: updatedPlayer.users?.isadmin ?? false` to the returned `data`.

- [ ] **Step 6: Fix `makePlayerAdmin()` (line ~339)**

Replace the update to target `users` table:
```typescript
// 1. Get player to find userid
const player = await this.prisma.player.findUnique({
  where: { id: BigInt(playerId) },
  select: { userid: true, name: true, imageurl: true, isactive: true },
});

if (!player) return { success: false, error: 'Player not found' };
if (!player.userid) return { success: false, error: 'Player has no associated user' };

// 2. Update users.isadmin
await this.prisma.user.update({
  where: { id: player.userid },
  data: { isadmin: true, lastmodifieddate: new Date() },
});

return { success: true, data: { id: BigInt(playerId), name: player.name, imageurl: player.imageurl, isactive: player.isactive, isadmin: true } };
```

- [ ] **Step 7: Fix `removePlayerAdmin()` (line ~385) — same pattern as Step 6**

Same as Step 6 but set `isadmin: false`. Keep the existing guard: `if (BigInt(playerId) === BigInt(1))` → return error.

- [ ] **Step 8: Commit**
```bash
git add apps/api/src/app.controller.ts
git commit -m "fix: correct isadmin checks to use users table instead of players"
```

---

## Task 2: Fix `finishGame()` status value

**Context:** Currently `finishGame()` stores `status: 'FINISHED'`. Historical data uses `'Encerrado'`. Standardize on `'Encerrado'` so analytics queries only need one filter value.

**Files:**
- Modify: `apps/api/src/games/games.service.ts`

- [ ] **Step 1: Update `finishGame()` to store `'Encerrado'`**

In `games.service.ts`, find the `prisma.game.update` call inside `finishGame()` (line ~362). Change:
```typescript
status: 'FINISHED',
```
to:
```typescript
status: 'Encerrado',
```

- [ ] **Step 2: Update `finishGame()` guard query**

In the same method, the `prisma.game.findFirst` that checks the game is not already finished (line ~304). Change:
```typescript
NOT: {
  status: {
    in: ['FINISHED', 'Encerrado'],
  },
},
```
to:
```typescript
NOT: { status: 'Encerrado' },
```

- [ ] **Step 3: Simplify `normalizeGameStatus()`**

The method now only needs to map `'Encerrado'` → `'FINISHED'` for backward compatibility with the frontend, or we can remove it entirely and update the frontend to display `'Encerrado'`. Since this is an internal status string used in the UI, simplify to:
```typescript
private normalizeGameStatus(game: any): any {
  return {
    ...game,
    status: game.status === 'Encerrado' ? 'Encerrado' : game.status,
  };
}
```
Actually, `normalizeGameStatus()` is now a no-op. Remove it entirely and remove the calls to it (they just `return game` after). Update callers: `createGame`, `getActiveGames`, `getAllGames`, `getGameById`, `finishGame` — remove the `.map(game => this.normalizeGameStatus(game))` / `return this.normalizeGameStatus(game)` calls.

- [ ] **Step 4: Commit**
```bash
git add apps/api/src/games/games.service.ts
git commit -m "fix: standardize game status to 'Encerrado', remove normalizeGameStatus"
```

---

## Task 3: Analytics Service — core ranking logic

**Context:** New NestJS module. Follows exact same pattern as `GamesModule`. No new Prisma models needed.

**Files:**
- Create: `apps/api/src/analytics/analytics.service.ts`
- Create: `apps/api/src/analytics/analytics.service.spec.ts`

- [ ] **Step 1: Create the service file**

```typescript
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
    // For LAST_GAME: find the most recent finished game id first
    let gameIdFilter: bigint | undefined;
    if (filter === 'LAST_GAME') {
      const lastGame = await this.prisma.game.findFirst({
        where: { status: 'Encerrado' },
        orderBy: { createddate: 'desc' },
        select: { id: true },
      });
      if (!lastGame) return { filter, entries: [] };
      gameIdFilter = lastGame.id;
    }

    const dateFilter = this.getDateFilterForPeriod(filter);

    const details = await this.prisma.gameDetail.findMany({
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

    // Group by (playerId, gameId) → profit per game
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

    // Aggregate by player
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
    const details = await this.prisma.gameDetail.findMany({
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

    // Group by (playerId, gameId) → profit and month
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
    const games = await this.prisma.game.findMany({
      where: { status: 'Encerrado' },
      select: { createddate: true },
    });
    const years = [...new Set(games.map((g) => g.createddate.getFullYear()))].sort((a, b) => b - a);
    return { years };
  }
}
```

- [ ] **Step 2: Write unit tests for `getRanking()`**

```typescript
// apps/api/src/analytics/analytics.service.spec.ts
import { Test } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma.service';

const mockDetails = [
  // Player 1 (id=1), Game 1: buyIn 100, cashout 150 → profit +50
  { playerid: BigInt(1), gameid: BigInt(1), value: '100', chipstotal: '0', players: { name: 'Alice' }, games: { createddate: new Date('2025-03-15') } },
  { playerid: BigInt(1), gameid: BigInt(1), value: '0', chipstotal: '150', players: { name: 'Alice' }, games: { createddate: new Date('2025-03-15') } },
  // Player 2 (id=2), Game 1: buyIn 100, cashout 50 → profit -50
  { playerid: BigInt(2), gameid: BigInt(1), value: '100', chipstotal: '0', players: { name: 'Bob' }, games: { createddate: new Date('2025-03-15') } },
  { playerid: BigInt(2), gameid: BigInt(1), value: '0', chipstotal: '50', players: { name: 'Bob' }, games: { createddate: new Date('2025-03-15') } },
];

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: { gamedetails: { findMany: jest.Mock }; games: { findFirst: jest.Mock; findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      gamedetails: { findMany: jest.fn().mockResolvedValue(mockDetails) },
      games: {
        findFirst: jest.fn().mockResolvedValue({ id: BigInt(1) }),
        findMany: jest.fn().mockResolvedValue([{ createddate: new Date('2025-01-01') }]),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AnalyticsService);
  });

  it('ranks players by totalProfit descending', async () => {
    const result = await service.getRanking('ALL_TIME');
    expect(result.entries[0].playerName).toBe('Alice');
    expect(result.entries[0].totalProfit).toBe(50);
    expect(result.entries[0].rank).toBe(1);
    expect(result.entries[1].playerName).toBe('Bob');
    expect(result.entries[1].totalProfit).toBe(-50);
    expect(result.entries[1].rank).toBe(2);
  });

  it('calculates winRate correctly', async () => {
    const result = await service.getRanking('ALL_TIME');
    expect(result.entries[0].winRate).toBe(100); // Alice won 1/1 games
    expect(result.entries[1].winRate).toBe(0);   // Bob won 0/1 games
  });

  it('excludes playerid=0 (Capile)', async () => {
    const detailsWithCapile = [
      ...mockDetails,
      { playerid: BigInt(0), gameid: BigInt(1), value: '0', chipstotal: '0', players: { name: 'Capile' }, games: { createddate: new Date() } },
    ];
    prisma.gamedetails.findMany.mockResolvedValue(detailsWithCapile);
    // The WHERE clause handles this at DB level; verify playerid=0 not in results
    const result = await service.getRanking('ALL_TIME');
    const capile = result.entries.find(e => e.playerName === 'Capile');
    expect(capile).toBeUndefined();
  });

  it('returns empty entries when no finished games exist for LAST_GAME', async () => {
    prisma.games.findFirst.mockResolvedValue(null);
    const result = await service.getRanking('LAST_GAME');
    expect(result.entries).toHaveLength(0);
  });

  it('getAvailableYears returns distinct years desc', async () => {
    prisma.games.findMany.mockResolvedValue([
      { createddate: new Date('2025-06-01') },
      { createddate: new Date('2024-03-01') },
      { createddate: new Date('2025-11-01') },
    ]);
    const result = await service.getAvailableYears();
    expect(result.years).toEqual([2025, 2024]);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail (service not wired yet is fine — imports must resolve)**
```bash
cd apps/api && npx jest src/analytics/analytics.service.spec.ts --no-coverage
```
Expected: Tests run, some may fail due to logic issues — that's fine. All must compile.

- [ ] **Step 4: Run tests again after creating the service to confirm they pass**
```bash
cd apps/api && npx jest src/analytics/analytics.service.spec.ts --no-coverage
```
Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**
```bash
git add apps/api/src/analytics/analytics.service.ts apps/api/src/analytics/analytics.service.spec.ts
git commit -m "feat: add AnalyticsService with ranking, monthly, and available-years logic"
```

---

## Task 4: Analytics Controller + Module

**Files:**
- Create: `apps/api/src/analytics/analytics.controller.ts`
- Create: `apps/api/src/analytics/analytics.module.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Create controller**

```typescript
// apps/api/src/analytics/analytics.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService, type RankingFilter } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('ranking')
  @ApiOperation({ summary: 'Get player ranking with filter' })
  async getRanking(@Query('filter') filter: string = 'ALL_TIME') {
    const validFilters: RankingFilter[] = ['LAST_GAME', 'CURRENT_MONTH', 'CURRENT_YEAR', 'ALL_TIME'];
    const safeFilter: RankingFilter = validFilters.includes(filter as RankingFilter)
      ? (filter as RankingFilter)
      : 'ALL_TIME';
    return this.analyticsService.getRanking(safeFilter);
  }

  @Get('ranking/monthly')
  @ApiOperation({ summary: 'Get monthly ranking for a year' })
  async getMonthlyRanking(@Query('year') year: string) {
    const parsedYear = parseInt(year) || new Date().getFullYear();
    return this.analyticsService.getMonthlyRanking(parsedYear);
  }

  @Get('available-years')
  @ApiOperation({ summary: 'Get years that have finished games' })
  async getAvailableYears() {
    return this.analyticsService.getAvailableYears();
  }
}
```

- [ ] **Step 2: Create module**

```typescript
// apps/api/src/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PrismaService],
})
export class AnalyticsModule {}
```

- [ ] **Step 3: Register in `app.module.ts`**

```typescript
// apps/api/src/app.module.ts
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [AuthModule, GamesModule, AnalyticsModule],
  // ...rest unchanged
})
```

- [ ] **Step 4: Start API and verify endpoints respond**
```bash
cd apps/api && bun run dev
# In another terminal:
curl "http://localhost:3000/analytics/ranking?filter=ALL_TIME"
curl "http://localhost:3000/analytics/available-years"
```
Expected: JSON responses (may be empty arrays if no `Encerrado` games yet).

- [ ] **Step 5: Commit**
```bash
git add apps/api/src/analytics/ apps/api/src/app.module.ts
git commit -m "feat: add AnalyticsModule with ranking and available-years endpoints"
```

---

## Task 5: Frontend HTTP client for analytics

**Files:**
- Create: `apps/web/src/http/analytics.service.ts`
- Modify: `apps/web/src/http/index.ts`

- [ ] **Step 1: Create analytics HTTP service**

```typescript
// apps/web/src/http/analytics.service.ts
import { apiClient, extractApiError } from './api-client';

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

export interface RankingResponse {
  filter: string;
  entries: RankingEntry[];
}

export interface MonthlyRankingEntry {
  rank: number;
  playerId: string;
  playerName: string;
  monthly: Record<number, number>;
  yearTotal: number;
  gamesPlayed: number;
}

export class AnalyticsHttpService {
  async getRanking(filter: RankingFilter = 'ALL_TIME'): Promise<RankingResponse> {
    try {
      return await apiClient.get('analytics/ranking', { searchParams: { filter } }).json<RankingResponse>();
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  async getMonthlyRanking(year: number): Promise<MonthlyRankingEntry[]> {
    try {
      return await apiClient.get('analytics/ranking/monthly', { searchParams: { year } }).json<MonthlyRankingEntry[]>();
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  async getAvailableYears(): Promise<{ years: number[] }> {
    try {
      return await apiClient.get('analytics/available-years').json<{ years: number[] }>();
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }
}

export const analyticsHttpService = new AnalyticsHttpService();
```

- [ ] **Step 2: Export from `http/index.ts`**

Open `apps/web/src/http/index.ts` and add:
```typescript
export { analyticsHttpService } from './analytics.service';
export type { RankingEntry, RankingResponse, MonthlyRankingEntry, RankingFilter } from './analytics.service';
```

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/http/analytics.service.ts apps/web/src/http/index.ts
git commit -m "feat: add analytics HTTP service client"
```

---

## Task 6: Leaderboard with real data

**Context:** Replace all mock data in `leaderboard.tsx`. New filters: "Último Jogo" | "Mês Atual" | "Ano Atual" | "Sempre". Remove "Your Position" card and win rate column mock. Add real `winRate` from API.

**Files:**
- Modify: `apps/web/src/components/leaderboard.tsx`

- [ ] **Step 1: Rewrite `leaderboard.tsx`**

Replace the entire file with:

```typescript
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
```

- [ ] **Step 2: Run the web app and verify the leaderboard loads**
```bash
# From repo root:
bun run dev
# Open http://localhost:5173/app
```
Expected: Leaderboard loads with filters. Clicking filters triggers new requests visible in Network tab.

- [ ] **Step 3: Commit**
```bash
git add apps/web/src/components/leaderboard.tsx
git commit -m "feat: replace leaderboard mock data with real analytics API"
```

---

## Task 7: RankingPage — full monthly table

**Files:**
- Create: `apps/web/src/pages/RankingPage.tsx`
- Modify: `apps/web/src/router/index.tsx`
- Modify: `apps/web/src/components/header.tsx`

- [ ] **Step 1: Create `RankingPage.tsx`**

```typescript
// apps/web/src/pages/RankingPage.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@skillers/ui";
import { analyticsHttpService, type MonthlyRankingEntry } from "../http/analytics.service";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function RankingPage() {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [entries, setEntries] = useState<MonthlyRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsHttpService.getAvailableYears().then((res) => {
      setYears(res.years);
      if (res.years.length > 0) setSelectedYear(res.years[0]);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    analyticsHttpService
      .getMonthlyRanking(selectedYear)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return null;
    const isPositive = value >= 0;
    return (
      <span className={`text-xs font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? "+" : ""}
        {value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Ranking Anual</h1>
        <p className="text-muted-foreground">Lucro/prejuízo mensal por jogador</p>
      </div>

      {/* Year selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">Ano:</span>
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedYear === y
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Sem dados para {selectedYear}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ranking {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                  <th className="text-left p-3 font-medium text-muted-foreground min-w-32">Jogador</th>
                  {MONTHS.map((m) => (
                    <th key={m} className="text-center p-3 font-medium text-muted-foreground w-16">{m}</th>
                  ))}
                  <th className="text-right p-3 font-medium text-muted-foreground w-20">Total</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.playerId} className="border-b last:border-b-0 hover:bg-muted/50">
                    <td className="p-3 text-muted-foreground">{entry.rank}</td>
                    <td className="p-3 font-medium">{entry.playerName}</td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <td key={month} className="p-3 text-center">
                        {formatValue(entry.monthly[month])}
                      </td>
                    ))}
                    <td className={`p-3 text-right font-semibold ${entry.yearTotal >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {entry.yearTotal >= 0 ? "+" : ""}
                      {entry.yearTotal.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add route in `router/index.tsx`**

Add import and route:
```typescript
import { RankingPage } from "../pages/RankingPage";

// Inside the /app children array:
{
  path: "ranking",
  element: <RankingPage />,
},
```

- [ ] **Step 3: Add "Ranking" link in `header.tsx`**

Open `apps/web/src/components/header.tsx`. Find the nav links section and add a link to `/app/ranking`. Follow the exact same pattern used for other nav items in that file.

- [ ] **Step 4: Verify RankingPage in browser**
```bash
# Navigate to http://localhost:5173/app/ranking
```
Expected: Table shows with year selector, monthly columns, profit values colored green/red.

- [ ] **Step 5: Commit**
```bash
git add apps/web/src/pages/RankingPage.tsx apps/web/src/router/index.tsx apps/web/src/components/header.tsx
git commit -m "feat: add RankingPage with monthly Jan-Dez table and nav link"
```

---

## Verification Checklist

Before calling this complete, verify:

- [ ] `GET /players` — response includes `isadmin` sourced from `users` table
- [ ] `GET /players/admins` — returns users with `isadmin=true` with associated player
- [ ] `POST /players/:id/make-admin` — updates `users.isadmin`, returns error if player has no `userid`
- [ ] `PUT /games/:id/finish` — stores `status = 'Encerrado'` in DB
- [ ] `GET /analytics/ranking?filter=ALL_TIME` — returns real player data, no playerid=0
- [ ] `GET /analytics/ranking?filter=LAST_GAME` — returns only players from the most recent game
- [ ] `GET /analytics/ranking/monthly?year=2025` — returns monthly breakdown
- [ ] `GET /analytics/available-years` — returns years array
- [ ] Leaderboard on `/app` — filters work, data is real
- [ ] `/app/ranking` — page loads, year selector works, table shows colored values
- [ ] All Jest tests pass: `cd apps/api && npx jest --no-coverage`
