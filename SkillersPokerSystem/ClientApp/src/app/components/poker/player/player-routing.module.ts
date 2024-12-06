import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PlayerDetailComponent } from './player-detail/player-detail.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { PlayerEditComponent } from './player-edit/player-edit.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', redirectTo: 'list', pathMatch: 'full' },
        { path: 'list', data: { breadcrumb: 'Listagem' }, component: PlayerListComponent },
        { path: 'create', data: { breadcrumb: 'Detail' }, component: PlayerEditComponent },
        { path: 'edit/:id', data: { breadcrumb: 'Edição' }, component: PlayerEditComponent },
        { path: 'player-detail/:id', data: { breadcrumb: 'Detail' }, component: PlayerDetailComponent },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PlayerRoutingModule { }

