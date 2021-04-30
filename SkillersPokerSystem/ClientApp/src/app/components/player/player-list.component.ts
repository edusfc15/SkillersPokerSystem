
import { Component, Inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Player } from 'src/app/interfaces/player';

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
    private router: Router,
    public auth: AuthService
  ) {

    this.players = [];
    this.loadData();
    

  }

  loadData() {

    var url = this.baseUrl + 'api/player/all'

    console.log(url);
    

    this.http.get<Player[]>(url).subscribe(
      res => {
        this.players = res;
      }
    );

  }

  onSelect(player : Player) {

    this.router.navigate(["/player-detail", player.Id]);

  }

  onActive() {
    var url = this.baseUrl + 'api/baseApi/setActive';

    this.http.get(url).subscribe(
      res => {
        this.loadData();
    })
  }
}
