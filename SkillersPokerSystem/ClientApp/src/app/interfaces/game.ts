import { GameDetail } from "./gameDetail";

export interface Game {
  Id: number;
  GameId: number;
  CreatedDate: string;
  Status: string;
  GameDetails: GameDetail[];
}
