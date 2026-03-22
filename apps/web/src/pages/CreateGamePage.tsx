import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue, Alert, AlertDescription } from '@skillers/ui';
import { ChevronLeft, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { gameService } from '../services/game.service';
import { playerService } from '../services/player.service';
import type { Player } from '../http/player.service';

interface PlayerBuyIn {
  playerId: string;
  playerName: string;
  amount: number;
}

export function CreateGamePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [playerBuyIns, setPlayerBuyIns] = useState<PlayerBuyIn[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('-1');
  const [buyInAmount, setBuyInAmount] = useState<number>(0);

  // Check for active game and load players on mount
  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true);
        
        // Check for active game
        const games = await gameService.getActiveGames();
        const activeGame = games.find(g => g.status === 'ACTIVE');
        if (activeGame) {
          navigate(`/app/games/${activeGame.id}`, { replace: true });
          return;
        }

        // Load active players
        const players = await playerService.getActivePlayers();
        setActivePlayers(players);
      } catch (err) {
        console.error('Erro ao inicializar página:', err);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  const handleAddPlayerBuyIn = () => {
    if (selectedPlayerId === '-1' || buyInAmount <= 0) {
      setError('Selecione um jogador e um valor válido');
      return;
    }

    const player = activePlayers.find(p => String(p.id) === selectedPlayerId);
    if (!player) return;

    // Check if player already has a buy-in
    if (playerBuyIns.some(pb => pb.playerId === selectedPlayerId)) {
      setError('Este jogador já tem um buy-in adicionado');
      return;
    }

    setPlayerBuyIns([
      ...playerBuyIns,
      {
        playerId: selectedPlayerId,
        playerName: player.name,
        amount: buyInAmount,
      },
    ]);

    setSelectedPlayerId('-1');
    setBuyInAmount(0);
    setError(null);
  };

  const handleRemovePlayerBuyIn = (playerId: string) => {
    setPlayerBuyIns(playerBuyIns.filter(pb => pb.playerId !== playerId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError(null);
      
      // Create game with default rake (ID 1)
      const result = await gameService.createGame({
        rakeId: 1,
        name: '',
        description: '',
      });
      console.log('Jogo criado:', result);

      // Add buy-ins for each player
      for (const playerBuyIn of playerBuyIns) {
        await gameService.registerBuyIn(String(result.id), {
          playerId: Number(playerBuyIn.playerId),
          amount: playerBuyIn.amount,
          tip: 0,
        });
      }

      navigate(`/app/games/${result.id}`);
    } catch (err) {
      console.error('Erro ao criar jogo:', err);
      setError(err instanceof Error ? err.message : 'Falha ao criar jogo');
      setCreating(false);
    }
  };

  // Show loading state while checking for active games
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando jogos ativos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/games')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Iniciar novo jogo</h1>
          <p className="text-muted-foreground mt-2">
            Crie um novo jogo de poker e adicione os buy-ins dos jogadores
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Add Player Buy-in Section */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="text-lg font-semibold">Adicionar Buy-ins dos Jogadores</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">
                    Selecione o jogador
                  </label>
                  <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um jogador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">Selecione um jogador</SelectItem>
                      {(() => {
                        const available = activePlayers.filter(p => !playerBuyIns.some(pb => pb.playerId === String(p.id)));
                        const ativos = available.filter(p => p.isactive);
                        const inativos = available.filter(p => !p.isactive);
                        return (
                          <>
                            {ativos.length > 0 && (
                              <SelectGroup>
                                <SelectLabel>Ativos</SelectLabel>
                                {ativos.map(player => (
                                  <SelectItem key={String(player.id)} value={String(player.id)}>
                                    {player.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            )}
                            {inativos.length > 0 && (
                              <>
                                {ativos.length > 0 && <SelectSeparator />}
                                <SelectGroup>
                                  <SelectLabel>Inativos</SelectLabel>
                                  {inativos.map(player => (
                                    <SelectItem key={String(player.id)} value={String(player.id)}>
                                      {player.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </>
                            )}
                          </>
                        );
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="buyInAmount" className="block text-sm font-medium text-card-foreground mb-1">
                    Valor do Buy-in
                  </label>
                  <div className="flex gap-2 mb-2">
                    {[5, 10, 20, 50].map(value => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setBuyInAmount(value)}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                          buyInAmount === value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        R${value}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="buyInAmount"
                      type="number"
                      value={buyInAmount}
                      onChange={(e) => setBuyInAmount(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddPlayerBuyIn}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Players List */}
            {playerBuyIns.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground">
                  Jogadores adicionados ({playerBuyIns.length})
                </h4>
                <div className="space-y-2">
                  {playerBuyIns.map(playerBuyIn => (
                    <div
                      key={playerBuyIn.playerId}
                      className="flex items-center justify-between p-3 bg-secondary/10 border border-secondary/20 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{playerBuyIn.playerName}</p>
                        <p className="text-sm text-muted-foreground">
                          Buy-in: ${playerBuyIn.amount.toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePlayerBuyIn(playerBuyIn.playerId)}
                        className="p-2 hover:bg-destructive/20 rounded-md transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-card-foreground">
                      Total de buy-ins: <span className="font-semibold text-primary">
                        ${playerBuyIns.reduce((sum, pb) => sum + pb.amount, 0).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/app/games')}
                disabled={creating}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="flex-1"
              >
                {creating ? 'Iniciando...' : 'Iniciar Jogo'}
              </Button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-secondary/10 border border-secondary/20 rounded-lg">
          <h3 className="font-semibold text-card-foreground mb-2">Próximos passos</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Adicione os buy-ins dos jogadores antes de iniciar</li>
            <li>✓ Seu jogo será criado e colocado em status ATIVO</li>
            <li>✓ Registre cashouts e rake na tela do jogo</li>
            <li>✓ Marque o jogo como finalizado quando balanceado</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
