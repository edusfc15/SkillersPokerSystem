import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/auth.interface';
import { ZodValidationPipe } from '../common/pipes';
import {
  type CreateGameDto,
  type BuyInDto,
  type CashoutDto,
  type FinishGameDto,
  createGameSchema,
  buyInSchema,
  cashoutSchema,
  finishGameSchema,
} from './dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createGame(
    @Body(new ZodValidationPipe(createGameSchema)) createGameDto: CreateGameDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.gamesService.createGame(user.id, createGameDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getActiveGames(@CurrentUser() user: AuthenticatedUser) {
    return this.gamesService.getActiveGames(user.id);
  }

  @Get('all/list')
  async getAllGames(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    return this.gamesService.getAllGames(pageNum, limitNum);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getGameById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.gamesService.getGameById(id, user.id);
  }

  @Get(':id/summary')
  @UseGuards(JwtAuthGuard)
  async getGameSummary(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.gamesService.getGameSummary(id, user.id);
  }

  @Post(':id/buy-in')
  @UseGuards(JwtAuthGuard)
  async registerBuyIn(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(buyInSchema)) buyInDto: BuyInDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.gamesService.registerBuyIn(id, user.id, buyInDto);
  }

  @Post(':id/cashout')
  @UseGuards(JwtAuthGuard)
  async registerCashout(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(cashoutSchema)) cashoutDto: CashoutDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.gamesService.registerCashout(id, user.id, cashoutDto);
  }

  @Put(':id/finish')
  @UseGuards(JwtAuthGuard)
  async finishGame(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(finishGameSchema)) finishGameDto: FinishGameDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.gamesService.finishGame(id, user.id, finishGameDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteGame(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.gamesService.deleteGame(id, user.id);
  }

  @Delete(':gameId/transactions/:transactionId')
  @UseGuards(JwtAuthGuard)
  async deleteTransaction(
    @Param('gameId') gameId: string,
    @Param('transactionId') transactionId: string,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.gamesService.deleteTransaction(gameId, transactionId, user.id);
  }
}
