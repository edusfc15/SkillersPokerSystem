
import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'game-list',
  templateUrl: 'game-list.component.html',
  styleUrls: ['game-list.component.css']
})
export class GameListComponent {

  games: Game[];
  selectedGame: Game;
  diaDaSemana: string;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private router: Router,
    public auth: AuthService,
  ) { }

  ngOnInit() {

    var url = this.baseUrl + "api/game/latest";

    this.http.get<Game[]>(url).subscribe(result => {
      this.games = result;
    }, error => console.error(error));

  }

  onSelect(game: Game) {
    this.selectedGame = game;
    this.router.navigate(["/game", this.selectedGame.GameId]);
  }


}
