import { playerHttpService } from '../http';
import type { Player } from '../http/player.service';

class PlayerService {
  /**
   * Busca todos os jogadores ativos
   */
  async getActivePlayers(): Promise<Player[]> {
    return await playerHttpService.getActivePlayers();
  }
}

export const playerService = new PlayerService();
