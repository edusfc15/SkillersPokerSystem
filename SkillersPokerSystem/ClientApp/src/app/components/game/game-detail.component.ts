import { Component, Inject, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from '../../services/auth.service';
import { Game } from "src/app/interfaces/game";


@Component({
  selector: "game-detail",
  templateUrl: './game-detail.component.html'
})

export class GameDetailComponent {

  game: Game;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public auth: AuthService,
    @Inject('BASE_URL') private baseUrl: string) {

    // create an empty object from the file interface
    this.game = <Game>{};

    var id = +this.activatedRoute.snapshot.params["id"];
    if (id) {
      var url = this.baseUrl + "api/game/" + id;

      this.http.get<Game>(url).subscribe(result => {
        this.game = result;
      }, error => console.error(error));
    }
    else {
      console.log("Id invalido, voltando para pagina inicial...");
      this.router.navigate(["home"]);
    }
  }

  updateGame(game: Game) {
    this.game = game;
  }

}
