import { useState, useEffect } from 'react';
import { Button, Input } from '@skillers/ui';
import { 
  Plus, 
  Minus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Modal } from './modal';
import { useGames } from '../hooks/use-games';
import { gameService } from '../services/game.service';
import { playerService } from '../services/player.service';
import type { BuyInDto, CashoutDto } from '../types/game';
import type { Player } from '../http/player.service';

interface GameDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string | null;
}

export function GameDetailModal({ isOpen, onClose, gameId }: GameDetailModalProps) {
  const { 
    currentGame, 
    loading, 
    error,
    loadGame,
    registerBuyIn,
    registerCashout,
    finishGame,
  } = useGames();

  const [showBuyInForm, setShowBuyInForm] = useState(false);
  const [showCashoutForm, setShowCashoutForm] = useState(false);
  const [buyInData, setBuyInData] = useState<BuyInDto>({ playerId: 0, amount: 0, tip: 0 });
  const [cashoutData, setCashoutData] = useState<CashoutDto>({ playerId: 0, amount: 0 });
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Load game and players when modal opens
  useEffect(() => {
    if (isOpen && gameId) {
      loadGame(gameId);
      loadActivePlayers();
    }
  }, [isOpen, gameId, loadGame]);

  const loadActivePlayers = async () => {
    try {
      setLoadingPlayers(true);
      const players = await playerService.getActivePlayers();
      setActivePlayers(players);
    } catch (err) {
      console.error('Failed to load active players:', err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  if (!currentGame || !gameId) {
    return null;
  }

  const stats = gameService.calculateGameStats(currentGame);
  const canFinish = gameService.canFinishGame(currentGame);
  const transactions = currentGame.gamedetails ? 
    gameService.transformGameDetailsToTransactions(currentGame.gamedetails) : [];

  // Extract rake from Capile (player ID 0) tip field
  const rakeTransaction = transactions.find(t => t.playerId === '0');
  const rakeAmount = rakeTransaction?.tip || 0;

  // Get available players - combine game players with active players
  const gamePlayerIds = new Set(
    (currentGame.gamedetails || [])
      .filter(detail => Number(detail.playerid) !== 0)
      .map(detail => String(detail.playerid))
  );

  const availablePlayers = activePlayers.filter(p => gamePlayerIds.has(String(p.id)));

  // All players (for new entries)
  const allPlayersForSelection = activePlayers;

  // Group transactions by player
  const playerSummaries = new Map<string, {
    name: string;
    buyInTotal: number;
    cashOutTotal: number;
    transactions: typeof transactions;

  }>();

  transactions.forEach(transaction => {
    // Filter out player ID 0 (invalid player)
    if (transaction.playerId === '0') {
      return;
    }

    if (!playerSummaries.has(transaction.playerId)) {
      playerSummaries.set(transaction.playerId, {
        name: transaction.playerName,
        buyInTotal: 0,
        cashOutTotal: 0,
        transactions: [],
      });
    }

    const summary = playerSummaries.get(transaction.playerId)!;
    if (transaction.type === 'BUY_IN') {
      summary.buyInTotal += transaction.amount;
    } else {
      summary.cashOutTotal += transaction.amount;
    }
    summary.transactions.push(transaction);
  });

  const handleBuyIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;
    
    try {
      await registerBuyIn(gameId, buyInData);
      setBuyInData({ playerId: 0, amount: 0, tip: 0 });
      setShowBuyInForm(false);
    } catch (error) {
      console.error('Failed to register buy-in:', error);
    }
  };

  const handleCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;
    
    try {
      await registerCashout(gameId, cashoutData);
      setCashoutData({ playerId: 0, amount: 0 });
      setShowCashoutForm(false);
    } catch (error) {
      console.error('Failed to register cashout:', error);
    }
  };

  const handleFinishGame = async () => {
    if (!gameId || !canFinish.canFinish) return;
    
    const confirmed = confirm('Are you sure you want to finish this game? This action cannot be undone.');
    if (confirmed) {
      try {
        await finishGame(gameId, {});
      } catch (error) {
        console.error('Failed to finish game:', error);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Game #${currentGame.id} - ${currentGame.status}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium text-muted-foreground">Players</span>
            </div>
            <p className="text-2xl font-bold text-secondary mt-2">{stats.playerCount}</p>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Buy-ins</span>
            </div>
            <p className="text-2xl font-bold text-success mt-2">
              {gameService.formatCurrency(stats.totalBuyIns)}
            </p>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Minus className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Cashouts</span>
            </div>
            <p className="text-2xl font-bold text-primary mt-2">
              {gameService.formatCurrency(stats.totalCashOuts)}
            </p>
          </div>
          
          <div className="bg-card border border-border p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Rake</span>
            </div>
            <p className="text-2xl font-bold text-warning mt-2">
              {gameService.formatCurrency(rakeAmount)}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {currentGame.status === 'ACTIVE' && (
          <div className="flex gap-3">
            <Button
              onClick={() => setShowBuyInForm(!showBuyInForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buy-in
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowCashoutForm(!showCashoutForm)}
              className="flex items-center gap-2"
            >
              <Minus className="w-4 h-4" />
              Cashout
            </Button>
            
            <Button
              variant={canFinish.canFinish ? "default" : "outline"}
              onClick={handleFinishGame}
              disabled={!canFinish.canFinish}
              className="flex items-center gap-2 ml-auto"
            >
              <CheckCircle className="w-4 h-4" />
              Finish Game
            </Button>
          </div>
        )}

        {/* Finish Game Status */}
        {!canFinish.canFinish && currentGame.status === 'ACTIVE' && (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-warning">
              <strong>Cannot finish game:</strong> {canFinish.reason}
            </p>
          </div>
        )}

        {/* Buy-in Form */}
        {showBuyInForm && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h3 className="text-lg font-medium mb-4">Register Buy-in</h3>
            <form onSubmit={handleBuyIn} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="buyinPlayer" className="block text-sm font-medium text-card-foreground mb-1">
                    Player
                  </label>
                  <select
                    id="buyinPlayer"
                    value={buyInData.playerId}
                    onChange={(e) => setBuyInData(prev => ({ ...prev, playerId: Number(e.target.value) }))}
                    required
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={0}>Select player</option>
                    {allPlayersForSelection.map(player => (
                      <option key={String(player.id)} value={Number(player.id)}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="buyinAmount" className="block text-sm font-medium text-card-foreground mb-1">
                    Amount
                  </label>
                  <Input
                    id="buyinAmount"
                    type="number"
                    value={buyInData.amount}
                    onChange={(e) => setBuyInData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  Register Buy-in
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowBuyInForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Cashout Form */}
        {showCashoutForm && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h3 className="text-lg font-medium mb-4">Register Cashout</h3>
            <form onSubmit={handleCashout} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cashoutPlayer" className="block text-sm font-medium text-card-foreground mb-1">
                    Player
                  </label>
                  <select
                    id="cashoutPlayer"
                    value={cashoutData.playerId}
                    onChange={(e) => setCashoutData(prev => ({ ...prev, playerId: Number(e.target.value) }))}
                    required
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={0}>Select player</option>
                    {allPlayersForSelection.map(player => (
                      <option key={String(player.id)} value={Number(player.id)}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="cashoutAmount" className="block text-sm font-medium text-card-foreground mb-1">
                    Amount
                  </label>
                  <Input
                    id="cashoutAmount"
                    type="number"
                    value={cashoutData.amount}
                    onChange={(e) => setCashoutData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  Register Cashout
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCashoutForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Players Summary */}
        <div>
          <h3 className="text-lg font-medium mb-4">Players Summary</h3>
          {playerSummaries.size === 0 ? (
            <p className="text-muted-foreground text-center py-8">No players yet</p>
          ) : (
            <div className="space-y-3">
              {Array.from(playerSummaries.entries()).map(([playerId, summary]) => {
                const balance = summary.cashOutTotal - summary.buyInTotal;
                return (
                  <div key={playerId} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-base">{summary.name}</h4>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        balance > 0 ? 'bg-success/20 text-success' : balance < 0 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                      }`}>
                        {balance > 0 ? '+' : ''}{gameService.formatCurrency(balance)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div className="bg-success/10 border border-success/20 p-2 rounded">
                        <p className="text-muted-foreground">Buy-in</p>
                        <p className="font-semibold text-success">{gameService.formatCurrency(summary.buyInTotal)}</p>
                      </div>
                      <div className="bg-primary/10 border border-primary/20 p-2 rounded">
                        <p className="text-muted-foreground">Cashout</p>
                        <p className="font-semibold text-primary">{gameService.formatCurrency(summary.cashOutTotal)}</p>
                      </div>
                      <div className="bg-secondary/10 border border-secondary/20 p-2 rounded">
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-semibold text-secondary">{summary.transactions.length}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div>
          <h3 className="text-lg font-medium mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    transaction.type === 'BUY_IN' ? 'border-success/20 bg-success/5' : 'border-primary/20 bg-primary/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'BUY_IN' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                    }`}>
                      {transaction.type === 'BUY_IN' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.playerName}</p>
                      <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'BUY_IN' ? 'text-success' : 'text-primary'
                    }`}>
                      {transaction.type === 'BUY_IN' ? '+' : '-'}{gameService.formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {gameService.formatDateTime(transaction.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
