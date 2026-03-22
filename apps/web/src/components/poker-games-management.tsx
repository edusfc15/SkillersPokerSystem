import { 
  Card, 
  CardContent, 
  Button
} from '@skillers/ui';
import {
  DollarSign,
  Users,
  Trophy,
  Play,
  Pause,
  Eye,
  Trash2,
  Coins,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useGames } from '../hooks/use-games';
import { gameService } from '../services/game.service';
// import { CreateGameModal } from './create-game-modal';
// import { GameDetailModal } from './game-detail-modal';
import type { GameListItem } from '../types/game';

export function PokerGamesManagement() {
  const {
    games,
    loading,
    error,
    deleteGame,
    clearError,
  } = useGames();

  // Modal state - commented until components are properly integrated
  // const [showCreateModal, setShowCreateModal] = useState(false);
  // const [showDetailModal, setShowDetailModal] = useState(false);
  // const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // const handleCreateGame = async (data: CreateGameDto) => {
  //   await createGame(data);
  //   setShowCreateModal(false);
  // };

  // const handleViewGame = async (gameId: string) => {
  //   setSelectedGameId(gameId);
  //   await loadGame(gameId);
  //   setShowDetailModal(true);
  // };

  const handleDeleteGame = async (gameId: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      await deleteGame(gameId);
    }
  };

  if (loading && games.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando jogos...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jogos de Poker</h1>
          <p className="text-gray-600">Gerencie seus jogos de poker</p>
        </div>
        {/* TODO: Implement create game functionality
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Game
        </Button>
        */}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Games Grid */}
      {games.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum jogo ainda</h3>
          <p className="text-gray-600 mb-4">Crie seu primeiro jogo de poker para começar</p>
          {/* TODO: Implement create game functionality
          <Button onClick={() => setShowCreateModal(true)}>
            Create New Game
          </Button>
          */}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onView={() => console.log('View game:', game.id)} // TODO: Implement view functionality
              onDelete={() => handleDeleteGame(game.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {/* TODO: Uncomment when components are properly exported
      <CreateGameModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGame}
      />

      <GameDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        gameId={selectedGameId}
      />
      */}
    </div>
  );
}

interface GameCardProps {
  game: GameListItem;
  onView: () => void;
  onDelete: () => void;
}

function GameCard({ game, onView, onDelete }: GameCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'FINISHED':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Play className="w-4 h-4" />;
      case 'FINISHED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Pause className="w-4 h-4" />;
    }
  };

  const isBalanced = Math.abs(game.balance) < 0.01;
  const balanceColor = game.balance > 0 ? 'text-green-600' : game.balance < 0 ? 'text-red-600' : 'text-gray-600';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Game #{game.id}</h3>
              <p className="text-sm text-gray-600">
                {gameService.formatDateTime(game.createdDate)}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(game.status)}`}>
            {getStatusIcon(game.status)}
            {game.status}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Jogadores</span>
            </div>
            <span className="font-medium">{game.playerCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Buy-ins</span>
            </div>
            <span className="font-medium">{gameService.formatCurrency(game.totalBuyIns)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Cashouts</span>
            </div>
            <span className="font-medium">{gameService.formatCurrency(game.totalCashOuts)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Saldo</span>
            </div>
            <span className={`font-medium ${balanceColor}`}>
              {gameService.formatCurrency(game.balance)}
              {isBalanced && <CheckCircle className="w-4 h-4 ml-1 inline text-green-600" />}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver
          </Button>
          {game.playerCount === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
