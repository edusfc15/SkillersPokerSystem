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
  /**
   * Obtém o ranking de jogadores com filtro
   */
  async getRanking(filter: RankingFilter = 'ALL_TIME'): Promise<RankingResponse> {
    try {
      return await apiClient.get('analytics/ranking', { searchParams: { filter } }).json<RankingResponse>();
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Obtém o ranking mensal de jogadores para um ano específico
   */
  async getMonthlyRanking(year: number): Promise<MonthlyRankingEntry[]> {
    try {
      return await apiClient.get('analytics/ranking/monthly', { searchParams: { year } }).json<MonthlyRankingEntry[]>();
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Obtém os anos disponíveis para análise
   */
  async getAvailableYears(): Promise<{ years: number[] }> {
    try {
      return await apiClient.get('analytics/available-years').json<{ years: number[] }>();
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }
}

// Instância singleton do serviço
export const analyticsHttpService = new AnalyticsHttpService();
