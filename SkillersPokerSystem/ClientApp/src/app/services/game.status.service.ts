import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
