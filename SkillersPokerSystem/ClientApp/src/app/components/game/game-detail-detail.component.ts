import { Component, Inject, Input } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from '../../services/auth.service';


@Component({
  selector: "game-detail-detail",
  templateUrl: './game-detail-detail.component.html'
})

export class GameDetailDetailComponent {

  game: Game;
  gameDetails: GameDetail[];
  gameStatus: boolean;


  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private router: Router,
    public auth: AuthService
  ) {

    this.gameDetails = [];

    this.loadData();
    

  }

  loadData() {
    var id = +this.activatedRoute.snapshot.params["id"];

    if (id) {
      var url = this.baseUrl + "api/gameDetail/detail/" + id;
      var gameUrl = this.baseUrl + 'api/game/' + id;

      //get game for status
      this.http.get<Game>(gameUrl).subscribe(
        result => {this.game = result;
        this.gameStatus = this.game.Status === 'Aberto';
      }
      );



      this.http.get<GameDetail[]>(url).subscribe(result => {
        this.gameDetails = result;
      }, error => console.error(error));

    }
    else {
      console.log("Id invalido, voltando para pagina inicial...");
      this.router.navigate(["home"]);
    }
  }

  onDelete(gameDetail: GameDetail) {

    if ("Tem certeza que deseja excluir o detalhe?") {

      var url = this.baseUrl + 'api/gamedetail/' + gameDetail.Id;

      this.http.delete(url)
        .subscribe(res => {
          this.loadData();
        }, error => console.log(error))
    }


  }

  onBack() {
    this.router.navigate(['game', +this.activatedRoute.snapshot.params["id"]])
  }

}
