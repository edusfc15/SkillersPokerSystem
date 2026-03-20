import { useState, useEffect, useCallback } from 'react';
import { gameService } from '../services/game.service';
import type {
  PokerGame,
  GameListItem,
  GameSummary,
  CreateGameDto,
  BuyInDto,
  CashoutDto,
  FinishGameDto,
} from '../types/game';

interface UseGamesReturn {
  // State
  games: GameListItem[];
  currentGame: PokerGame | null;
  gameSummary: GameSummary | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadGames: () => Promise<void>;
  loadGame: (id: string) => Promise<void>;
  loadGameSummary: (id: string) => Promise<void>;
  createGame: (data: CreateGameDto) => Promise<void>;
  registerBuyIn: (gameId: string, data: BuyInDto) => Promise<void>;
  registerCashout: (gameId: string, data: CashoutDto) => Promise<void>;
  finishGame: (gameId: string, data: FinishGameDto) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentGame: () => void;
}

export function useGames(): UseGamesReturn {
  const [games, setGames] = useState<GameListItem[]>([]);
  const [currentGame, setCurrentGame] = useState<PokerGame | null>(null);
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear current game
  const clearCurrentGame = useCallback(() => {
    setCurrentGame(null);
    setGameSummary(null);
  }, []);

  // Load all games
  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const gamesData = await gameService.getActiveGames();
      setGames(gamesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load specific game
  const loadGame = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const gameData = await gameService.getGame(id);
      setCurrentGame(gameData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load game summary
  const loadGameSummary = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const summaryData = await gameService.getGameSummary(id);
      setGameSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game summary');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new game
  const createGame = useCallback(async (data: CreateGameDto) => {
    try {
      setLoading(true);
      setError(null);
      const newGame = await gameService.createGame(data);
      setCurrentGame(newGame);
      // Reload games list
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  }, [loadGames]);

  // Register buy-in
  const registerBuyIn = useCallback(async (gameId: string, data: BuyInDto) => {
    try {
      setLoading(true);
      setError(null);
      await gameService.registerBuyIn(gameId, data);
      // Reload current game to reflect changes
      await loadGame(gameId);
      await loadGames(); // Also reload games list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register buy-in');
    } finally {
      setLoading(false);
    }
  }, [loadGame, loadGames]);

  // Register cashout
  const registerCashout = useCallback(async (gameId: string, data: CashoutDto) => {
    try {
      setLoading(true);
      setError(null);
      await gameService.registerCashout(gameId, data);
      // Reload current game to reflect changes
      await loadGame(gameId);
      await loadGames(); // Also reload games list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register cashout');
    } finally {
      setLoading(false);
    }
  }, [loadGame, loadGames]);

  // Finish game
  const finishGame = useCallback(async (gameId: string, data: FinishGameDto) => {
    try {
      setLoading(true);
      setError(null);
      const finishedGame = await gameService.finishGame(gameId, data);
      console.log('Finished game response:', finishedGame);
      setCurrentGame(finishedGame);
      await loadGames(); // Reload games list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finish game');
    } finally {
      setLoading(false);
    }
  }, [loadGames]);

  // Delete game
  const deleteGame = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await gameService.deleteGame(id);
      // If we deleted the current game, clear it
      if (currentGame && String(currentGame.id) === id) {
        clearCurrentGame();
      }
      await loadGames(); // Reload games list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete game');
    } finally {
      setLoading(false);
    }
  }, [currentGame, clearCurrentGame, loadGames]);

  // Load games on mount
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return {
    // State
    games,
    currentGame,
    gameSummary,
    loading,
    error,

    // Actions
    loadGames,
    loadGame,
    loadGameSummary,
    createGame,
    registerBuyIn,
    registerCashout,
    finishGame,
    deleteGame,
    clearError,
    clearCurrentGame,
  };
}
