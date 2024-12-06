import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GameListComponent } from './game-list/game-list.component';
import { GameEditComponent } from './game-edit/game-edit.component';
import { GameDetailComponent } from './game-detail/game-detail.component';
import { GameDetailTipEditComponent } from './game-detail-tip-edit/game-detail-tip-edit.component';
import { GameDetailEditComponent } from './game-detail-edit/game-detail-edit.component';
import { GameDetailOverviewComponent } from './game-detail-overview/game-detail-overview.component';

@NgModule({
    imports: [RouterModule.forChild([

        { path: '', redirectTo: 'list', pathMatch: 'full' },
        { path: 'list', data: { breadcrumb: 'Listagem' }, component: GameListComponent },
        { path: 'create', data: { breadcrumb: 'Inclusão de jogo' }, component: GameEditComponent },
        { path: ':id', data: { breadcrumb: 'Listagem' }, component: GameDetailComponent },
        { path: 'detail-overview/:id', data: { breadcrumb: 'Detalhes de buy in' }, component: GameDetailOverviewComponent },
        { path: 'gameDetail/create/:action/:gameId/:playerId', data: { breadcrumb: 'Inclusão de Detalhe de partida' },component: GameDetailEditComponent },
        { path: 'gameDetail/tip/:gameId', data: { breadcrumb: 'Inclusão de capilé' }, component: GameDetailTipEditComponent }

    ])],
    exports: [RouterModule]
})
export class GameRoutingModule { }
