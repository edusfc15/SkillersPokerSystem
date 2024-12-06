import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
	imports: [RouterModule.forChild([
		
		{ path: '',  data: { breadcrumb: 'Poker Dashboard' }, loadChildren: () => import('./dashboard/dashboards.module').then(m => m.DashboardsModule) },
		{ path: 'ranking',  data: { breadcrumb: 'Ranking' }, loadChildren: () => import('./ranking/ranking.module').then(m => m.RankingModule) },
		{ path: 'player',  data: { breadcrumb: 'Jogadores' }, loadChildren: () => import('./player/player.module').then(m => m.PlayerModule) },
		{ path: 'game',  data: { breadcrumb: 'Partidas' }, loadChildren: () => import('./game/game.module').then(m => m.GameModule) },


        // { path: '**', redirectTo: '/notfound' }
	])],
	exports: [RouterModule]
})
export class PokerRoutingModule { }
