import { PokerGamesManagement } from '../components/poker-games-management';

export function PokerGamesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <PokerGamesManagement />
      </div>
    </div>
  );
}
