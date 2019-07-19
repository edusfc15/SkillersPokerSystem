import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from "@angular/router";
import { GameStatus } from '../../services/game.status.service';

@Component({
  selector: 'nav-menu',
  templateUrl: './nav-menu.component.html'
})
export class NavMenuComponent implements OnInit {

  navbarCollapsed: boolean;
  gameStatusDescription : string; 
  activeGame: boolean;

  constructor(
    public auth: AuthService,
	private router: Router,
	private gameStatus : GameStatus
  ) { 

	  this.gameStatus.getGameStatus().subscribe( (status:boolean) => { 
		  this.activeGame = status; 
		  this.checkStatus(this.activeGame);
	} )

  }

  ngOnInit() {
	this.navbarCollapsed = true;

  }


  logout(): boolean {
    // logs out the user, then redirects him to Home View.
    if (this.auth.logout()) {
      this.router.navigate([""]);
    }
    return false;
  }

  checkStatus(ActiveGameStatus: boolean){
		if (ActiveGameStatus) {
			this.gameStatusDescription = "Gerenciar Jogo"
		} else {
			this.gameStatusDescription = "Iniciar Jogo"
		}
  }


}
