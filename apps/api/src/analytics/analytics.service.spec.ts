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

  it('excludes playerid=0 (Capile) from results', async () => {
    // playerid=0 is filtered at DB level via WHERE clause; verify no Capile in results
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
