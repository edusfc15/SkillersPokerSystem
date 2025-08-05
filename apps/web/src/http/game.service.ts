import { apiClient, extractApiError } from './api-client';

// Tipos para exemplo (você pode criar interfaces mais específicas)
interface Game {
  id: string;
  name: string;
  status: string;
  createdDate: string;
  // adicione outros campos conforme necessário
}

interface CreateGameDto {
  name: string;
  // adicione outros campos conforme necessário
}

export class GameHttpService {
  /**
   * Lista todos os jogos do usuário
   */
  async getGames(): Promise<Game[]> {
    try {
      const response = await apiClient.get('games').json<Game[]>();
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Busca um jogo específico por ID
   */
  async getGame(id: string): Promise<Game> {
    try {
      const response = await apiClient.get(`games/${id}`).json<Game>();
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Cria um novo jogo
   */
  async createGame(data: CreateGameDto): Promise<Game> {
    try {
      const response = await apiClient.post('games', {
        json: data,
      }).json<Game>();
      
      return response;
    } catch (error) {
      const message = await extractApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Atualiza um jogo existente
   */
  async updateGame(id: string, data: Partial<CreateGameDto>): Promise<Game> {
    try {
      const response = await apiClient.patch(`games/${id}`, {
        json: data,
      }).json<Game>();
      
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
}

// Instância singleton do serviço
export const gameHttpService = new GameHttpService();
