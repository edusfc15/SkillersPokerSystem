
import { Component, Inject, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Game } from 'src/app/interfaces/game';
import { LazyLoadEvent } from 'primeng/api';
import { ApiResult } from 'src/app/services/base.service';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'game-list',
  templateUrl: 'game-list.component.html',
  styleUrls: ['game-list.component.css']
})
export class GameListComponent {

  games: Game[];
  selectedGame: Game;
  totalRecords: number;
  loading: boolean;
  public defaultSortColumn: string = "Id";
  public defaultSortOrder: string = "DESC";

  constructor(
    private router: Router,
    public auth: AuthService,
    private gameService: GameService,
  ) { }

  ngOnInit() {
  }


  onRowSelect(game: any) {   
    this.router.navigate(["/game", game.id]);
  }

  loadGames(event: LazyLoadEvent) {

    var sortColumn = (event.sortField)
      ? event.sortField
      : this.defaultSortColumn;

      var stringOrder = event.sortOrder == -1 ? "ASC" : "DESC"

      var sortOrder = (event.sortOrder)
      ? stringOrder
      : this.defaultSortOrder;
    
    this.gameService.getData<ApiResult<Game>>(
      (event.first!/event.rows!),
      event.rows!,
      sortColumn ,
      sortOrder,
      "",
      "")
      .subscribe(result => {
        this.games = result.data;
        this.totalRecords = result.totalCount;
      }, error => console.error(error));

  }



}
