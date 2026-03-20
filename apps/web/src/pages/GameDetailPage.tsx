import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Alert, AlertDescription, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@skillers/ui';
import { 
  ChevronLeft, 
  Plus, 
  Minus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useGames } from '../hooks/use-games';
import { gameService } from '../services/game.service';
import { playerService } from '../services/player.service';
import type { BuyInDto, CashoutDto } from '../types/game';
import type { Player } from '../http/player.service';

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
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
  const [showRakeForm, setShowRakeForm] = useState(false);
  const [rakeFormAmount, setRakeFormAmount] = useState(0);
  const [rakeError, setRakeError] = useState<string>('');
  const [buyInData, setBuyInData] = useState<BuyInDto>({ playerId: -1, amount: 0, tip: 0 });
  const [cashoutData, setCashoutData] = useState<CashoutDto>({ playerId: -1, amount: 0 });
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);

  // Load game and players on mount
  useEffect(() => {
    if (gameId) {
      loadGame(gameId);
      loadActivePlayers();
    }
  }, [gameId, loadGame]);

  const loadActivePlayers = async () => {
    try {
      setActivePlayers([]);
      const players = await playerService.getActivePlayers();
      setActivePlayers(players);
    } catch (err) {
      console.error('Failed to load active players:', err);
    }
  };

  const handleBuyIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;
    
    try {
      await registerBuyIn(gameId, buyInData);
      setBuyInData({ playerId: -1, amount: 0, tip: 0 });
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
      setCashoutData({ playerId: -1, amount: 0 });
      setShowCashoutForm(false);
    } catch (error) {
      console.error('Failed to register cashout:', error);
    }
  };

  const handleAddRake = async (e: React.FormEvent) => {
    e.preventDefault();
    setRakeError('');
    
    if (!gameId) return;
    
    // Validate amount
    if (rakeFormAmount <= 0) {
      setRakeError('Amount must be positive');
      return;
    }
    
    try {
      // Register rake as a buy-in for Capile (player ID 0) with the amount as tip
      await registerBuyIn(gameId, { playerId: 0, amount: 0, tip: rakeFormAmount });
      setRakeFormAmount(0);
      setRakeError('');
      setShowRakeForm(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register rake';
      setRakeError(errorMessage);
      console.error('Failed to register rake:', error);
    }
  };

  const handleFinishGame = async () => {
    if (!gameId || !canFinish.canFinish) return;
    
    const confirmed = confirm('Are you sure you want to finish this game? This action cannot be undone.');
    if (confirmed) {
      try {
        await finishGame(gameId, {});
        navigate('/games');
      } catch (error) {
        console.error('Failed to finish game:', error);
      }
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!gameId) return;

    const confirmed = confirm('Are you sure you want to delete this transaction? This action cannot be undone.');
    if (confirmed) {
      try {
        await gameService.deleteTransaction(gameId, transactionId);
        await loadGame(gameId);
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const handleRepeatLastBuyIn = () => {
    if (buyInData.playerId <= 0) return; // Player not selected

    // Find all buy-ins for this player
    const playerBuyIns = transactions.filter(
      t => t.playerId === String(buyInData.playerId) && t.type === 'BUY_IN'
    );

    if (playerBuyIns.length === 0) return; // No previous buy-ins

    // Get the last buy-in
    const lastBuyIn = playerBuyIns[playerBuyIns.length - 1];
    
    // Set the amount to the last buy-in amount
    setBuyInData(prev => ({
      ...prev,
      amount: lastBuyIn.amount || 0
    }));
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

  // All players (for new entries) - exclude Capile (ID 0)
  const allPlayersForSelection = activePlayers.filter(p => Number(p.id) !== 0);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/games')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Games
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Game #{currentGame.id.toString()}</h1>
              <p className="text-muted-foreground mt-2">
                Status: <span className={`font-semibold ${currentGame.status === 'ACTIVE' ? 'text-success' : 'text-secondary'}`}>
                  {currentGame.status}
                </span>
              </p>
            </div>
            {currentGame.status === 'ACTIVE' && (
              <Button
                onClick={handleFinishGame}
                disabled={!canFinish.canFinish || loading}
                className={!canFinish.canFinish ? 'opacity-50 cursor-not-allowed' : ''}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finish Game
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!canFinish.canFinish && currentGame.status === 'ACTIVE' && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Cannot finish game:</strong> {canFinish.reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Players</p>
                <p className="text-3xl font-bold text-secondary">{stats.playerCount}</p>
              </div>
              <Users className="w-8 h-8 text-secondary opacity-20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Buy-ins</p>
                <p className="text-3xl font-bold text-success">{gameService.formatCurrency(stats.totalBuyIns)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success opacity-20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Cashouts</p>
                <p className="text-3xl font-bold text-primary">{gameService.formatCurrency(stats.totalCashOuts)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-20" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Rake</p>
                <p className="text-3xl font-bold text-warning">{gameService.formatCurrency(rakeAmount)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-warning opacity-20" />
            </div>
          </div>
        </div>

        {/* Buy-in Form */}
        {showBuyInForm && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h3 className="text-lg font-medium mb-4">Register Buy-in</h3>
            <form onSubmit={handleBuyIn} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">
                    Player
                  </label>
                  <Select value={String(buyInData.playerId)} onValueChange={(value: string) => setBuyInData(prev => ({ ...prev, playerId: Number(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">Select player</SelectItem>
                      {allPlayersForSelection.map(player => (
                        <SelectItem key={String(player.id)} value={String(player.id)}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {/* Quick add buttons */}
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[5, 10, 20, 50].map(value => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setBuyInData(prev => ({ ...prev, amount: prev.amount + value }))}
                        className="px-2 py-1 text-sm bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors"
                      >
                        +{value}
                      </button>
                    ))}
                  </div>
                  {/* Reset to minimum button */}
                  <button
                    type="button"
                    onClick={() => setBuyInData(prev => ({ ...prev, amount: 5 }))}
                    className="w-full mt-2 px-3 py-1 text-sm bg-secondary/20 hover:bg-secondary/30 text-secondary rounded transition-colors"
                  >
                    Reset to 5 (min)
                  </button>
                  {/* Repeat last buy-in button */}
                  {buyInData.playerId > 0 && transactions.some(t => t.playerId === String(buyInData.playerId) && t.type === 'BUY_IN') && (
                    <button
                      type="button"
                      onClick={handleRepeatLastBuyIn}
                      className="w-full mt-2 px-3 py-1 text-sm bg-accent/20 hover:bg-accent/30 text-accent rounded transition-colors"
                    >
                      Repetir último buy in
                    </button>
                  )}
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
                  <label className="block text-sm font-medium text-card-foreground mb-1">
                    Player
                  </label>
                  <Select value={String(cashoutData.playerId)} onValueChange={(value: string) => setCashoutData(prev => ({ ...prev, playerId: Number(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">Select player</SelectItem>
                      {allPlayersForSelection.map(player => (
                        <SelectItem key={String(player.id)} value={String(player.id)}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {/* Quick add buttons */}
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[5, 10, 20, 50].map(value => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCashoutData(prev => ({ ...prev, amount: prev.amount + value }))}
                        className="px-2 py-1 text-sm bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors"
                      >
                        +{value}
                      </button>
                    ))}
                  </div>
                  {/* Reset to minimum button */}
                  <button
                    type="button"
                    onClick={() => setCashoutData(prev => ({ ...prev, amount: 5 }))}
                    className="w-full mt-2 px-3 py-1 text-sm bg-secondary/20 hover:bg-secondary/30 text-secondary rounded transition-colors"
                  >
                    Reset to 5 (min)
                  </button>
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

        {/* Rake Form */}
        {showRakeForm && (
          <div className="border border-border rounded-lg p-4 bg-card">
            <h3 className="text-lg font-medium mb-4">Adicionar Rake</h3>
            {rakeError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{rakeError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleAddRake} className="space-y-4">
              <div>
                <label htmlFor="rakeAmount" className="block text-sm font-medium text-card-foreground mb-1">
                  Valor do Rake
                </label>
                <Input
                  id="rakeAmount"
                  type="number"
                  value={rakeFormAmount}
                  onChange={(e) => {
                    setRakeFormAmount(Number(e.target.value));
                    setRakeError('');
                  }}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">Amount must be positive</p>
                {/* Quick add buttons */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[5, 10, 20, 50].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRakeFormAmount(prev => prev + value)}
                      className="px-2 py-1 text-sm bg-primary/20 hover:bg-primary/30 text-primary rounded transition-colors"
                    >
                      +{value}
                    </button>
                  ))}
                </div>
                {/* Reset to zero button */}
                <button
                  type="button"
                  onClick={() => setRakeFormAmount(0)}
                  className="w-full mt-2 px-3 py-1 text-sm bg-secondary/20 hover:bg-secondary/30 text-secondary rounded transition-colors"
                >
                  Limpar
                </button>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || rakeFormAmount <= 0}>
                  Adicionar Rake
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowRakeForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        {!showBuyInForm && !showCashoutForm && !showRakeForm && currentGame.status === 'ACTIVE' && (
          <div className="flex gap-3">
            <Button
              onClick={() => setShowBuyInForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Buy-in
            </Button>
            <Button
              onClick={() => setShowCashoutForm(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Minus className="w-4 h-4" />
              Add Cashout
            </Button>
            <Button
              onClick={() => setShowRakeForm(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Adicionar Rake
            </Button>
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
                  <div className="flex items-center gap-3">
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
                    {currentGame?.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(String(transaction.id))}
                        className="p-2 hover:bg-destructive/20 rounded-md transition-colors text-destructive"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
