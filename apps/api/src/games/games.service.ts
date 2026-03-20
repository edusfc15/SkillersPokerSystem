import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGameDto, BuyInDto, CashoutDto, FinishGameDto } from './dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async createGame(userId: string, createGameDto: CreateGameDto) {
    const { rakeId } = createGameDto;

    console.log('Creating game for userId:', userId, 'with rakeId:', rakeId);

    // Verify that the rake exists
    const rake = await this.prisma.rake.findUnique({
      where: { id: BigInt(rakeId) },
    });

    if (!rake) {
      throw new NotFoundException('Rake configuration not found');
    }

    const game = await this.prisma.game.create({
      data: {
        status: 'ACTIVE',
        userid: userId,
        rakeid: BigInt(rakeId),
        viewcount: 0,
        createddate: new Date(),
        lastmodifieddate: new Date(),
        numberofhands: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayname: true,
          },
        },
      },
    });

    return game;
  }

  async getActiveGames(userId: string) {
    const games = await this.prisma.game.findMany({
      where: {
        userid: userId,
      },
      include: {
        rakes: true,
        gamedetails: {
          include: {
            players: true,
          },
        },
        _count: {
          select: {
            gamedetails: true,
          },
        },
      },
      orderBy: {
        createddate: 'desc',
      },
    });

    return games;
  }

  async getAllGames(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        include: {
          rakes: true,
          gamedetails: {
            include: {
              players: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              displayname: true,
            },
          },
          _count: {
            select: {
              gamedetails: true,
            },
          },
        },
        orderBy: {
          createddate: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.game.count(),
    ]);

    console.log(`getAllGames: Found ${games.length} games, total: ${total}`);
    console.log('Games statuses:', games.map(g => ({ id: g.id, status: g.status })));

    return {
      data: games,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGameById(gameId: string, userId: string) {
    const game = await this.prisma.game.findFirst({
      where: {
        id: BigInt(gameId),
        userid: userId,
      },
      include: {
        rakes: {
          include: {
            rakedetails: true,
          },
        },
        gamedetails: {
          include: {
            players: true,
          },
          orderBy: {
            createddate: 'asc',
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            displayname: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async registerBuyIn(gameId: string, userId: string, buyInDto: BuyInDto) {
    let { playerId, amount, tip = 0 } = buyInDto;

    // Convert to number if string
    playerId = typeof playerId === 'string' ? Number(playerId) : playerId;
    amount = typeof amount === 'string' ? Number(amount) : amount;
    tip = typeof tip === 'string' ? Number(tip) : tip;

    // Validate inputs
    if (playerId !== 0 && playerId <= 0) {
      throw new BadRequestException('Player ID must be positive');
    }
    
    // For rake (playerId 0), amount should be 0 and tip should be positive
    // For regular buy-in (playerId > 0), amount should be positive
    if (playerId === 0) {
      if (tip <= 0) {
        throw new BadRequestException('Amount must be positive');
      }
    } else {
      if (amount <= 0) {
        throw new BadRequestException('Amount must be positive');
      }
    }

    // Verify game exists and is active
    const game = await this.prisma.game.findFirst({
      where: {
        id: BigInt(gameId),
        userid: userId,
        status: 'ACTIVE',
      },
      include: {
        rakes: true,
      },
    });

    if (!game) {
      throw new NotFoundException('Active game not found');
    }

    // Verify player exists (allow playerId 0 for rake)
    if (playerId !== 0) {
      const player = await this.prisma.player.findUnique({
        where: { id: BigInt(playerId) },
      });

      if (!player) {
        throw new NotFoundException('Player not found');
      }
    }

    const totalAmount = amount + tip;

    return this.prisma.gameDetail.create({
      data: {
        gameid: BigInt(gameId),
        playerid: BigInt(playerId),
        value: totalAmount,
        chipstotal: 0, // BUY_IN: chipstotal should be empty/0
        ispaid: true,
        tip: tip,
        createddate: new Date(),
        lastmodifieddate: new Date(),
      },
      include: {
        players: true,
      },
    });
  }

  async registerCashout(gameId: string, userId: string, cashoutDto: CashoutDto) {
    const { playerId, amount } = cashoutDto;

    // Verify game exists and is active
    const game = await this.prisma.game.findFirst({
      where: {
        id: BigInt(gameId),
        userid: userId,
        status: 'ACTIVE',
      },
    });

    if (!game) {
      throw new NotFoundException('Active game not found');
    }

    // Verify player exists
    const player = await this.prisma.player.findUnique({
      where: { id: BigInt(playerId) },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    // Check if player has bought in (has positive value transactions)
    const playerBuyIns = await this.prisma.gameDetail.findMany({
      where: {
        gameid: BigInt(gameId),
        playerid: BigInt(playerId),
        value: {
          gt: 0,
        },
      },
    });

    if (playerBuyIns.length === 0) {
      throw new BadRequestException('Player must buy in before cashing out');
    }

    // Create cashout transaction
    return this.prisma.gameDetail.create({
      data: {
        gameid: BigInt(gameId),
        playerid: BigInt(playerId),
        value: 0, // CASH_OUT: value should be empty/0
        chipstotal: amount, // Cashout amount goes in chipstotal
        ispaid: true,
        tip: 0,
        createddate: new Date(),
        lastmodifieddate: new Date(),
      },
      include: {
        players: true,
      },
    });
  }

  async finishGame(gameId: string, userId: string, _finishGameDto: FinishGameDto) {
    // Verify game exists and is not already finished
    const existingGame = await this.prisma.game.findFirst({
      where: {
        id: BigInt(gameId),
        userid: userId,
        NOT: { status: 'Encerrado' },
      },
      include: {
        gamedetails: true,
        rakes: {
          include: {
            rakedetails: true,
          },
        },
      },
    });

    if (!existingGame) {
      throw new NotFoundException('Active game not found');
    }

    // Calculate totals
    // For normal players: value = amount (buy-in), chipstotal = amount (cashout), tip = 0
    // For Capile (player 0): value = 0, chipstotal = 0, tip = rake amount
    
    // Sum value field (buy-ins from normal players only)
    const totalBuyIns = existingGame.gamedetails
      .filter(detail => Number(detail.playerid) !== 0)
      .reduce((sum, detail) => sum + Number(detail.value), 0);

    // Sum chipstotal field (cashouts from normal players only)
    const totalCashOuts = existingGame.gamedetails
      .filter(detail => Number(detail.playerid) !== 0)
      .reduce((sum, detail) => sum + Number(detail.chipstotal), 0);

    // Sum tip field from Capile (player 0) only - this is the rake
    const totalRake = existingGame.gamedetails
      .filter(detail => Number(detail.playerid) === 0)
      .reduce((sum, detail) => sum + Number(detail.tip), 0);

    const expectedTotal = totalBuyIns;
    const actualTotal = totalCashOuts + totalRake;

    // Check if the game balances (allow 1% tolerance for rounding)
    const tolerance = totalBuyIns * 0.01;
    if (Math.abs(expectedTotal - actualTotal) > tolerance) {
      throw new BadRequestException(
        `Game cannot be finished. Buy-ins total: $${expectedTotal.toFixed(2)}, ` +
        `Cashouts + Rake total: $${actualTotal.toFixed(2)}. ` +
        `Difference: $${(expectedTotal - actualTotal).toFixed(2)}`
      );
    }

    console.log(`Attempting to update game ${gameId} status to Encerrado`);
    const game = await this.prisma.game.update({
      where: { id: BigInt(gameId) },
      data: {
        status: 'Encerrado',
        lastmodifieddate: new Date(),
      },
      include: {
        rakes: {
          include: {
            rakedetails: true,
          },
        },
        gamedetails: {
          include: {
            players: true,
          },
        },
      },
    });

    console.log(`Game ${gameId} finished. Status in DB:`, game.status);

    return game;
  }

  async getGameSummary(gameId: string, userId: string) {
    const game = await this.getGameById(gameId, userId);

    const buyIns = game.gamedetails.filter(detail => Number(detail.value) > 0);
    const cashOuts = game.gamedetails.filter(detail => Number(detail.value) < 0);

    const buyInTotal = buyIns.reduce((sum, detail) => sum + Number(detail.value), 0);
    const cashOutTotal = Math.abs(cashOuts.reduce((sum, detail) => sum + Number(detail.value), 0));

    // Calculate rake using the most recent rake detail
    let rakeAmount = 0;
    if (game.rakes?.rakedetails && game.rakes.rakedetails.length > 0) {
      const latestRakeDetail = game.rakes.rakedetails[game.rakes.rakedetails.length - 1];
      rakeAmount = buyInTotal * (Number(latestRakeDetail.percent) / 100);
    }

    // Calculate player summaries
    const playerSummaries = new Map();

    buyIns.forEach(buyIn => {
      const playerId = String(buyIn.playerid);
      if (!playerSummaries.has(playerId)) {
        playerSummaries.set(playerId, {
          player: buyIn.players,
          buyInTotal: 0,
          cashOutTotal: 0,
          netResult: 0,
        });
      }
      playerSummaries.get(playerId).buyInTotal += Number(buyIn.value);
    });

    cashOuts.forEach(cashOut => {
      const playerId = String(cashOut.playerid);
      if (!playerSummaries.has(playerId)) {
        playerSummaries.set(playerId, {
          player: cashOut.players,
          buyInTotal: 0,
          cashOutTotal: 0,
          netResult: 0,
        });
      }
      playerSummaries.get(playerId).cashOutTotal += Math.abs(Number(cashOut.value));
    });

    // Calculate net results
    playerSummaries.forEach(summary => {
      summary.netResult = summary.cashOutTotal - summary.buyInTotal;
    });

    return {
      game,
      summary: {
        totalBuyIns: buyInTotal,
        totalCashOuts: cashOutTotal,
        totalRake: rakeAmount,
        balance: buyInTotal - (cashOutTotal + rakeAmount),
        playerSummaries: Array.from(playerSummaries.values()),
      },
    };
  }

  async deleteGame(gameId: string, userId: string) {
    // Only allow deletion if game has no transactions
    const game = await this.prisma.game.findFirst({
      where: {
        id: BigInt(gameId),
        userid: userId,
      },
      include: {
        gamedetails: true,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.gamedetails.length > 0) {
      throw new BadRequestException('Cannot delete game with existing transactions');
    }

    return this.prisma.game.delete({
      where: { id: BigInt(gameId) },
    });
  }

  async deleteTransaction(gameId: string, transactionId: string, userId: string) {
    // Verify that the game belongs to the user
    const game = await this.prisma.game.findFirst({
      where: {
        id: BigInt(gameId),
        userid: userId,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Verify that the transaction belongs to this game
    const transaction = await this.prisma.gameDetail.findFirst({
      where: {
        id: BigInt(transactionId),
        gameid: BigInt(gameId),
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Only allow deletion if game is still active
    if (game.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot delete transactions from finished games');
    }

    return this.prisma.gameDetail.delete({
      where: { id: BigInt(transactionId) },
    });
  }
}
