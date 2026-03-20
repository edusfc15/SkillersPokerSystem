import { gameHttpService } from '../http';
import type {
  PokerGame,
  CreateGameDto,
  BuyInDto,
  CashoutDto,
  FinishGameDto,
  GameSummary,
  GamePlayer,
  GameListItem,
  PlayerTransaction,
  GameDetail,
} from '../types/game';

class GameService {
  /**
   * Busca todos os jogos ativos
   */
  async getActiveGames(): Promise<GameListItem[]> {
    const games = await gameHttpService.getActiveGames();
    return this.transformGamesToListItems(games);
  }

  /**
   * Busca todos os jogos do sistema
   */
  async getAllGames(page: number = 1, limit: number = 10): Promise<{
    data: GameListItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await gameHttpService.getAllGames(page, limit);
    return {
      data: this.transformGamesToListItems(response.data),
      pagination: response.pagination,
    };
  }

  /**
   * Busca um jogo específico por ID
   */
  async getGame(id: string): Promise<PokerGame> {
    return await gameHttpService.getGame(id);
  }

  /**
   * Busca o resumo de um jogo
   */
  async getGameSummary(id: string): Promise<GameSummary> {
    return await gameHttpService.getGameSummary(id);
  }

  /**
   * Cria um novo jogo
   */
  async createGame(data: CreateGameDto): Promise<PokerGame> {
    return await gameHttpService.createGame(data);
  }

  /**
   * Registra um buy-in
   */
  async registerBuyIn(gameId: string, data: BuyInDto): Promise<void> {
    await gameHttpService.registerBuyIn(gameId, data);
  }

  /**
   * Registra um cashout
   */
  async registerCashout(gameId: string, data: CashoutDto): Promise<void> {
    await gameHttpService.registerCashout(gameId, data);
  }

  /**
   * Finaliza um jogo
   */
  async finishGame(gameId: string, data: FinishGameDto): Promise<PokerGame> {
    return await gameHttpService.finishGame(gameId, data);
  }

  /**
   * Deleta um jogo
   */
  async deleteGame(id: string): Promise<void> {
    await gameHttpService.deleteGame(id);
  }

  /**
   * Deleta uma transação de um jogo
   */
  async deleteTransaction(gameId: string, transactionId: string): Promise<void> {
    await gameHttpService.deleteTransaction(gameId, transactionId);
  }

  /**
   * Busca jogadores ativos
   */
  async getActivePlayers(): Promise<GamePlayer[]> {
    return await gameHttpService.getActivePlayers();
  }

  /**
   * Transforma dados da API em dados para lista de jogos
   */
  private transformGamesToListItems(games: PokerGame[]): GameListItem[] {
    return games.map(game => {
      // Sum all values in gamedetails (including positive and negative)
      // Handle Decimal values from Prisma (they come as strings, numbers, or Decimal objects)
      const totalBuyIns = game.gamedetails?.reduce((sum, detail) => {
        let value: number;
        
        // Handle Prisma Decimal object format: { s: 1, e: 1, d: [20] }
        if (typeof detail.value === 'object' && detail.value !== null) {
          if ('d' in detail.value && Array.isArray(detail.value.d)) {
            // Decimal object: d contains digits, e is exponent, s is sign
            const digits = detail.value.d as number[];
            const exponent = (detail.value.e as number) || 0;
            const sign = (detail.value.s as number) || 1;
            
            // Reconstruct number from digits and exponent
            const numberStr = digits.join('');
            const intValue = parseInt(numberStr, 10);
            const decimalValue = intValue * Math.pow(10, exponent - numberStr.length + 1);
            value = sign === -1 ? -decimalValue : decimalValue;
          } else if ('toNumber' in detail.value) {
            // Prisma Decimal object with toNumber method
            value = (detail.value as any).toNumber();
          } else {
            // Empty object or unknown format
            value = 0;
          }
        } else if (typeof detail.value === 'string') {
          value = parseFloat(detail.value);
        } else {
          value = Number(detail.value);
        }
        
        return sum + (isNaN(value) ? 0 : value);
      }, 0) || 0;
      
      // Group players by ID to get unique players (excluding player with ID 0)
      const uniquePlayers = new Map<string, { id: string; name: string }>();
      game.gamedetails?.forEach(detail => {
        const playerId = Number(detail.playerid);
        // Ignorar jogadores com ID 0 (inválidos)
        if (playerId !== 0 && detail.players && !uniquePlayers.has(String(detail.playerid))) {
          uniquePlayers.set(String(detail.playerid), {
            id: String(detail.playerid),
            name: detail.players.name,
          });
        }
      });

      // Calculate winner based on net profit (chips total - buy-in value)
      const winner = this.calculateGameWinner(game.gamedetails || []);
      
      // Normalize status to ensure it's either ACTIVE or FINISHED
      // Handle empty strings, null, or any other value that should default to ACTIVE
      // Also handles Portuguese "Encerrado" (finished)
      const statusStr = String(game.status || '').trim().toUpperCase();
      const isFinished = statusStr === 'FINISHED' || statusStr === 'ENCERRADO';
      const normalizedStatus = isFinished ? 'FINISHED' : 'ACTIVE';
      
      return {
        id: String(game.id),
        status: normalizedStatus as 'ACTIVE' | 'FINISHED',
        createdDate: this.safeToISOString(game.createddate),
        playerCount: uniquePlayers.size,
        players: Array.from(uniquePlayers.values()),
        totalBuyIns,
        totalCashOuts: 0, // Not used in display
        balance: totalBuyIns,
        winner,
        rake: game.rakes ? {
          id: String(game.rakes.id),
          percentage: game.rakes.rakedetails?.[0]?.percent,
        } : undefined,
      };
    });
  }

  /**
   * Calcula o vencedor da partida baseado no lucro líquido
   * Fórmula: ChipsTotal (cashout) - Value (buy-in)
   * Ignora jogadores com ID 0 (inválidos)
   */
  private calculateGameWinner(gameDetails: GameDetail[]): string | undefined {
    if (!gameDetails || gameDetails.length === 0) {
      return undefined;
    }

    // Agrupar por jogador e calcular lucro
    const playerProfits = new Map<string, { name: string; profit: number }>();

    gameDetails.forEach(detail => {
      const playerName = detail.players?.name || 'Unknown';
      const playerKey = String(detail.playerid);
      const playerId = Number(detail.playerid);

      // Ignorar jogadores com ID 0 (inválidos)
      if (playerId === 0) {
        return;
      }

      // Converter value (buy-in) e chipstotal (cashout) para números
      const buyIn = this.parseDecimal(detail.value);
      const cashOut = this.parseDecimal(detail.chipstotal);

      // Calcular lucro: ChipsTotal (cashout) - Value (buy-in)
      const profit = cashOut - buyIn;

      if (playerProfits.has(playerKey)) {
        const existing = playerProfits.get(playerKey)!;
        existing.profit += profit;
      } else {
        playerProfits.set(playerKey, { name: playerName, profit });
      }
    });

    // Encontrar o jogador com maior lucro
    let winner: string | undefined;
    let maxProfit = Number.NEGATIVE_INFINITY;

    playerProfits.forEach(({ name, profit }) => {
      if (profit > maxProfit) {
        maxProfit = profit;
        winner = name;
      }
    });

    return winner;
  }

  /**
   * Transforma game details em transações de jogador
   */
  transformGameDetailsToTransactions(gameDetails: GameDetail[]): PlayerTransaction[] {
    return gameDetails.map(detail => {
      // Parse values to number (handle Decimal objects)
      const value = this.parseDecimal(detail.value);
      const chipsTotal = this.parseDecimal(detail.chipstotal);
      const tip = this.parseDecimal(detail.tip);

      // Determine type based on which field is populated:
      // BUY_IN: value is filled, chipstotal is 0
      // CASH_OUT: chipstotal is filled, value is 0
      const isBuyIn = value > 0;
      const isCashOut = chipsTotal > 0;
      const amount = isBuyIn ? value : isCashOut ? chipsTotal : 0;
      const type = isBuyIn ? 'BUY_IN' : isCashOut ? 'CASH_OUT' : 'BUY_IN';

      return {
        id: String(detail.id),
        playerId: String(detail.playerid),
        playerName: detail.players?.name || 'Unknown Player',
        type: type as 'BUY_IN' | 'CASH_OUT',
        amount: Math.abs(amount),
        tip: tip > 0 ? tip : undefined,
        timestamp: this.safeToISOString(detail.createddate),
        description: this.generateTransactionDescription({ value: isBuyIn ? value : -chipsTotal, tip }),
      };
    });
  }

  /**
   * Converte Decimal ou qualquer tipo de valor para número
   */
  private parseDecimal(value: any): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }

    if (typeof value === 'object' && value !== null) {
      // Prisma Decimal format: { s: sign (1 or -1), e: exponent, d: [digits] }
      if ('d' in value && Array.isArray(value.d)) {
        const digits = value.d as number[];
        const exponent = (value.e as number) || 0;
        const sign = (value.s as number) || 1;
        
        // Reconstruct the number from digits
        const digitStr = digits.join('');
        if (!digitStr || digitStr === '0') {
          return 0;
        }
        
        // The exponent represents the position of the decimal point
        // e.g., digits=[100], e=2 means 100 with exponent 2, so we need to shift decimal
        // Actually, in Prisma's Decimal, the number is stored as:
        // value = (d[0] * 10^0 + d[1] * 10^1 + ...) * 10^e
        // But we need to convert properly
        
        // Simpler approach: reconstruct as an integer then apply exponent
        const intValue = parseInt(digitStr, 10);
        // The exponent tells us where the decimal point is
        // Negative exponent means shift right (divide), positive means shift left (multiply)
        const result = intValue * Math.pow(10, exponent - digitStr.length + 1);
        
        return sign === -1 ? -result : result;
      }
      if ('toNumber' in value) {
        return (value as any).toNumber();
      }
    }

    return 0;
  }

  /**
   * Gera descrição para transação
   */
  private generateTransactionDescription(detail: {
    value: number;
    tip: number;
  }): string {
    const value = detail.value;
    const tip = detail.tip || 0;
    const amount = Math.abs(value);
    
    if (value > 0) {
      // Buy-in
      return tip > 0 ? `Buy-in: R$ ${amount - tip} + Tip: R$ ${tip}` : `Buy-in: R$ ${amount}`;
    } else {
      // Cashout
      return `Cashout: R$ ${amount}`;
    }
  }

  /**
   * Formata valor monetário
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Converte date para ISO string de forma segura
   */
  private safeToISOString(date: Date | string | undefined): string {
    if (!date) {
      return new Date().toISOString();
    }
    
    // If it's already a string, validate it
    if (typeof date === 'string') {
      if (date && date.length > 0) {
        try {
          // Validate it's a valid ISO date
          const parsed = new Date(date);
          if (!isNaN(parsed.getTime())) {
            return date;
          }
        } catch {
          // Invalid date string
        }
      }
    }
    
    // If it's a Date object
    if (date instanceof Date) {
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    // Fallback to today's date
    return new Date().toISOString();
  }

  /**
   * Formata data/hora
   */
  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  /**
   * Calcula estatísticas do jogo
   */
  calculateGameStats(game: PokerGame) {
    if (!game.gamedetails) {
      return {
        totalBuyIns: 0,
        totalCashOuts: 0,
        totalRake: 0,
        balance: 0,
        playerCount: 0,
      };
    }

    let totalBuyIns = 0;
    let totalCashOuts = 0;
    let totalRake = 0;

    game.gamedetails.forEach(detail => {
      const value = this.parseDecimal(detail.value);
      const chipsTotal = this.parseDecimal(detail.chipstotal);
      const tip = this.parseDecimal(detail.tip);
      const playerId = Number(detail.playerid);
      
      // For normal players: value = buy-in, chipstotal = cashout
      if (playerId !== 0) {
        totalBuyIns += value;
        totalCashOuts += chipsTotal;
      } else {
        // For Capile (player 0): tip = rake amount
        totalRake += tip;
      }
    });

    // Contar jogadores únicos (excluindo ID 0)
    const uniquePlayers = new Set(
      game.gamedetails
        .filter(detail => Number(detail.playerid) !== 0)
        .map(detail => detail.playerid)
    );
    
    // Balance: Buy-ins (normal players) = Cashouts (normal players) + Rake (Capile)
    // Should be 0 when the game is properly balanced
    const balance = totalBuyIns - totalCashOuts - totalRake;
    
    return {
      totalBuyIns,
      totalCashOuts,
      totalRake,
      balance,
      playerCount: uniquePlayers.size,
    };
  }

  /**
   * Verifica se um jogo pode ser finalizado
   * Fórmula: Buy-in Total = Cashout Total + Rake
   */
  canFinishGame(game: PokerGame): { canFinish: boolean; reason?: string } {
    const stats = this.calculateGameStats(game);
    
    if (stats.playerCount === 0) {
      return { canFinish: false, reason: 'No players in the game' };
    }

    if (stats.totalCashOuts === 0) {
      return { canFinish: false, reason: 'No cashouts recorded' };
    }

    // Verificar se o jogo está balanceado (tolerância de 1%)
    // Balance deve ser ~0: Buy-in Total - Cashout Total - Rake = 0
    const tolerance = stats.totalBuyIns * 0.01;
    if (Math.abs(stats.balance) > tolerance) {
      return { 
        canFinish: false, 
        reason: `Game is not balanced. Buy-ins: ${this.formatCurrency(stats.totalBuyIns)}, Cashouts: ${this.formatCurrency(stats.totalCashOuts)}, Rake: ${this.formatCurrency(stats.totalRake)}, Difference: ${this.formatCurrency(stats.balance)}` 
      };
    }

    return { canFinish: true };
  }
}

export const gameService = new GameService();
