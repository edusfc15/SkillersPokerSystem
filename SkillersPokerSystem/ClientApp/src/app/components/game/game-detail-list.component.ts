import { Component, Inject, Input, OnChanges, SimpleChanges, Output, EventEmitter  } from "@angular/core";
import {  Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from '../../services/auth.service';
import { template } from "@angular/core/src/render3";


@Component({
  selector: "game-detail-list",
  templateUrl: './game-detail-list.component.html'
})

export class GameDetailListComponent implements OnChanges  {

  @Input() game: Game;
  @Output() gameAtDetail = new EventEmitter();
  gameDetails: GameDetail[];
  totalOfGameDetail: TotalGameDetail[];
  totalResult: TotalGameDetail[];
  gameStatus: boolean;
  tempTotalResult: TotalGameDetail;

  constructor(private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private router: Router) {

    this.gameDetails = [];
    this.totalOfGameDetail = [];
    this.totalResult = [];
    this.tempTotalResult = <TotalGameDetail>{};
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (typeof changes['game'] !== "undefined") {

      // retrieve the file variable change info
      var change = changes['game'];

      // only perform the task if the value has been changed
      if (!change.isFirstChange()) {
        // execute the Http request and retrieve the result
        this.gameStatus = this.game.Status === 'Aberto';
        this.loadData();
      }
    }
  }

  loadData() {
    var url = this.baseUrl + "api/gameDetail/all/" + this.game.Id;
    this.http.get<GameDetail[]>(url).subscribe(result => {
      this.gameDetails = result;

      this.gameDetails.forEach(gd => {

        var tempTotal = <TotalGameDetail>{};
        tempTotal.Rebuys = gd.Value
        tempTotal.CashOut = gd.ChipsTotal;
        tempTotal.Integrity = gd.ChipsTotal - gd.Value;
        tempTotal.Rake = gd.Rake;
        this.totalOfGameDetail.push(tempTotal);

      });

      this.tempTotalResult.CashOut = this.totalOfGameDetail.reduce((sum, c) => sum + c.CashOut, 0)
      this.tempTotalResult.Rebuys = this.totalOfGameDetail.reduce((sum, c) => sum + c.Rebuys, 0)
      this.tempTotalResult.Rake = this.totalOfGameDetail.reduce((sum, c) => sum + c.Rake, 0)
      this.tempTotalResult.Integrity = this.totalOfGameDetail.reduce((sum, c) => sum + c.Integrity, 0)

      this.totalResult.push(this.tempTotalResult);

    }, error => console.error(error));
  }

  onSelect(game: Game) {
    this.router.navigate(["/game-detail-detail", this.game.Id]);
  }

  endGame(game: Game) {


    var url = this.baseUrl + 'api/game/endGame';

    if (game.Status === 'Aberto') {

      this.http.post<Game>(url, game)
        .subscribe(res => {
          this.game = res;
          this.gameAtDetail.emit(this.game);
        
        })
      
    }

  }


}
