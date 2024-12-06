import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GameStatus{
  private gameStatus: BehaviorSubject<boolean>;
  constructor() {
    this.gameStatus = new BehaviorSubject(true);
  }

  setGameStatus(status: boolean) {
	this.gameStatus.next(status);
  }

  getGameStatus(): Observable<boolean> {
    return this.gameStatus.asObservable();
  }
}
