
import { Component, Inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from '@angular/router';

import { Player } from 'src/app/interfaces/player';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'player-detail',
  templateUrl: 'player-detail.component.html',
  styleUrls: ['player-detail.component.css']
})
export class PlayerDetailComponent {

  player: Player;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public auth: AuthService
  ) {

    this.player = <Player>{ };
    this.loadData();

  }

  loadData() {

    var id = +this.activatedRoute.snapshot.params["id"];
    var url = this.baseUrl + 'api/player/' + id;
    
    if(id){

    this.http.get<Player>(url).subscribe(
      res => this.player = res
    );

    } else {
      console.log("Id invalido, voltando para jogadores...");
      this.router.navigate(["player"]);
    }

  }

  onBack() {
    this.router.navigate(['player']);
  }

  onEdit() {
    this.router.navigate(['player/edit', this.player.id]);
  }
}
