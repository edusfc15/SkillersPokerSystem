
import { Component, Inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Player } from 'src/app/interfaces/player';
import { PlayerService } from 'src/app/services/player.service';
import { ApiResult } from 'src/app/services/base.service';
import { SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';

@Component({
  selector: 'player-list',
  templateUrl: 'player-list.component.html',
  styleUrls: ['player-list.component.scss']
})
export class PlayerListComponent {

  players: Player[];
  sortOrder: number;
  sortField: string;
  sortOptions: SelectItem[];

  public defaultSortColumn: string = "isActive";
  public defaultSortOrder: string = "DESC";

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private router: Router,
    public auth: AuthService,
    private playerService: PlayerService
  ) {

    this.players = [];
    
    this.loadData();

    this.sortOptions = [
      {label: 'Nome', value: 'name'},
      {label: 'Aparicoes', value: '!showUpCount'},
      {label: 'Primeiro Jogo', value: 'firstGameDate'},
      {label: 'Ultimo Jogo', value: 'lastGameDate'}

  ];

  }

  loadData() {


    this.playerService.getData<ApiResult<Player>>(0, 50, this.defaultSortColumn, this.defaultSortOrder, "", "")
      .subscribe(result => {
        this.players = (result.data);
    
      }, error => console.error(error));

  }

  onSelect(player:Player) {  
    this.router.navigate(["/player/edit", player.id]);
  }

  onActive() {
    var url = this.baseUrl + 'api/baseApi/setActive';
    this.http.get(url).subscribe(
      res => {
        this.loadData();
      })
  }

  onSortChange(event:any) {
    let value = event.value;

    if (value.indexOf('!') === 0) {
        this.sortOrder = -1;
        this.sortField = value.substring(1, value.length);
    }
    else {
        this.sortOrder = 1;
        this.sortField = value;
    }
}

onFilter(dv: DataView, event: Event) {
  dv.filter((event.target as HTMLInputElement).value);
}


}
