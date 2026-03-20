import { apiClient, extractApiError } from './api-client';

export interface Player {
  id: bigint;
  name: string;
  imageurl?: string;
  isactive: boolean;
  registrationDate?: string;
  registrationDateFormatted?: string;
  lastActivity?: string;
  lastActivityFormatted?: string;
  gamesPlayed?: number;
  viewCount?: number;
  totalBuyIn?: number;
  totalCashout?: number;
  totalTip?: number;
  totalProfit?: number;
}

export interface PlayerDetails extends Player {
  firstgamedate: string;
  lastmodifieddate: string;
  viewcount: number;
  totalBuyIn: number;
  totalCashout: number;
  totalProfit: number;
  totalTip: number;
  gamesPlayed: number;
  viewCount: number;
}

export class PlayerHttpService {
  /**
   * Lista todos os jogadores
   */
  async getActivePlayers(): Promise<Player[]> {
    try {
      const response = await apiClient.get('players').json<Player[]>();
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Obtém detalhes de um jogador específico
   */
  async getPlayerDetails(id: string | number): Promise<PlayerDetails> {
    try {
      const response = await apiClient.get(`players/${id}`).json<PlayerDetails>();
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Atualiza dados do jogador
   */
  async updatePlayer(
    id: string | number,
    data: { name?: string; imageurl?: string; isactive?: boolean }
  ): Promise<Player> {
    try {
      const response = await apiClient.put(`players/${id}`, { json: data }).json<{ success: boolean; data: Player }>();
      if (!response.success) {
        throw new Error(response.error || 'Erro ao atualizar jogador');
      }
      return response.data;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Cria um novo jogador
   */
  async createPlayer(data: { name: string; imageurl?: string; userid: string; isactive?: boolean }): Promise<Player> {
    try {
      const response = await apiClient.post('players', { json: data }).json<{ success: boolean; data: Player }>();
      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar jogador');
      }
      return response.data;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }
}

export const playerHttpService = new PlayerHttpService();
