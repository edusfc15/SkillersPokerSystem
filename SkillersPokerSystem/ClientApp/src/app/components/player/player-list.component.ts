
import { Component, Inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';

@Component({
  selector: 'player-list',
  templateUrl: 'player-list.component.html',
  styleUrls: ['player-list.component.css']
})
export class PlayerListComponent {

  players: Player[];

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private router : Router
  ) {

    this.players = [];

    var url = this.baseUrl + '/api/player/all'

    this.http.get<Player[]>(url).subscribe(
      res => {
        this.players = res;
      }
    );

  }

  onSelect(player : Player) {

    this.router.navigate(["/player-detail", player.Id]);

  }
}
