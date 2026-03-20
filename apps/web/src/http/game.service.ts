import { apiClient, extractApiError } from './api-client';
import type {
  PokerGame,
  CreateGameDto,
  BuyInDto,
  CashoutDto,
  FinishGameDto,
  GameSummary,
  GamePlayer,
  GameDetail,
} from '../types/game';

export class GameHttpService {
  /**
   * Lista todos os jogos ativos do usuário
   */
  async getActiveGames(): Promise<PokerGame[]> {
    try {
      const response = await apiClient.get('games').json<PokerGame[]>();
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Lista todos os jogos do sistema com paginação
   */
  async getAllGames(page: number = 1, limit: number = 10): Promise<{
    data: PokerGame[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const response = await apiClient
        .get('games/all/list', {
          searchParams: {
            page: page.toString(),
            limit: limit.toString(),
          },
        })
        .json<{
          data: PokerGame[];
          pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        }>();
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Busca um jogo específico por ID
   */
  async getGame(id: string): Promise<PokerGame> {
    try {
      const response = await apiClient.get(`games/${id}`).json<PokerGame>();
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Busca o resumo de um jogo específico
   */
  async getGameSummary(id: string): Promise<GameSummary> {
    try {
      const response = await apiClient.get(`games/${id}/summary`).json<GameSummary>();
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Cria um novo jogo
   */
  async createGame(data: CreateGameDto): Promise<PokerGame> {
    try {
      const response = await apiClient.post('games', {
        json: data,
      }).json<PokerGame>();
      
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Registra um buy-in de jogador
   */
  async registerBuyIn(gameId: string, data: BuyInDto): Promise<GameDetail> {
    try {
      const response = await apiClient.post(`games/${gameId}/buy-in`, {
        json: data,
      }).json<GameDetail>();
      
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Registra um cashout de jogador
   */
  async registerCashout(gameId: string, data: CashoutDto): Promise<GameDetail> {
    try {
      const response = await apiClient.post(`games/${gameId}/cashout`, {
        json: data,
      }).json<GameDetail>();
      
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Finaliza um jogo
   */
  async finishGame(gameId: string, data: FinishGameDto): Promise<PokerGame> {
    try {
      const response = await apiClient.put(`games/${gameId}/finish`, {
        json: data,
      }).json<PokerGame>();
      
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Deleta um jogo
   */
  async deleteGame(id: string): Promise<void> {
    try {
      await apiClient.delete(`games/${id}`);
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Deleta uma transação de um jogo
   */
  async deleteTransaction(gameId: string, transactionId: string): Promise<void> {
    try {
      await apiClient.delete(`games/${gameId}/transactions/${transactionId}`);
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Lista todos os jogadores ativos
   */
  async getActivePlayers(): Promise<GamePlayer[]> {
    try {
      const response = await apiClient.get('players').json<GamePlayer[]>();
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }
}

// Instância singleton do serviço
export const gameHttpService = new GameHttpService();
