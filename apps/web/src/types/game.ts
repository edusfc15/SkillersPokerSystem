// Game Types
export interface PokerGame {
  id: bigint;
  viewcount: number;
  createddate: Date;
  lastmodifieddate: Date;
  status: string;
  numberofhands: number;
  rakeid: bigint;
  userid: string;
  rakes?: GameRake;
  gamedetails?: GameDetail[];
  user?: Pick<GameUser, 'id' | 'username' | 'displayname'>;
  _count?: {
    gamedetails: number;
  };
}

export interface GameDetail {
  id: bigint;
  gameid: bigint;
  playerid: bigint;
  value: number | string;
  createddate: Date;
  lastmodifieddate: Date;
  chipstotal: number | string;
  ispaid: boolean;
  tip: number | string;
  players?: GamePlayer;
}

export interface GamePlayer {
  id: bigint;
  name: string;
  firstgamedate: Date;
  lastmodifieddate: Date;
  viewcount: number;
  userid: string;
  isactive: boolean;
  createddate: Date;
  imageurl?: string;
}

export interface GameRake {
  id: bigint;
  enddate: Date;
  rakedetails?: RakeDetail[];
}

export interface RakeDetail {
  id: bigint;
  value: number;
  percent: number;
  rakeid: bigint;
}

export interface GameUser {
  id: string;
  username?: string;
  displayname?: string;
}

// DTOs for API requests
export interface CreateGameDto {
  name?: string;
  description?: string;
  rakeId: number;
}

export interface BuyInDto {
  playerId: number;
  amount: number;
  tip?: number;
}

export interface CashoutDto {
  playerId: number;
  amount: number;
  description?: string;
}

export interface FinishGameDto {
  notes?: string;
}

// Response types for UI
export interface GameSummary {
  game: PokerGame;
  summary: {
    totalBuyIns: number;
    totalCashOuts: number;
    totalRake: number;
    balance: number;
    playerSummaries: PlayerSummary[];
  };
}

export interface PlayerSummary {
  player: GamePlayer;
  buyInTotal: number;
  cashOutTotal: number;
  netResult: number;
}

// UI-specific types
export interface GameListItem {
  id: string;
  status: 'ACTIVE' | 'FINISHED';
  createdDate: string;
  playerCount: number;
  players: Array<{
    id: string;
    name: string;
  }>;
  totalBuyIns: number;
  totalCashOuts: number;
  balance: number;
  winner?: string;
  rake?: {
    id: string;
    percentage?: number;
  };
}

export interface PlayerTransaction {
  id: string;
  playerId: string;
  playerName: string;
  type: 'BUY_IN' | 'CASH_OUT';
  amount: number;
  tip?: number;
  timestamp: string;
  description?: string;
}
