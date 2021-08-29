import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { GameListComponent } from './components/game/game-list.component';
import { PlayerListComponent } from './components/player/player-list.component';
import { UserListComponent } from './components/user/user-list.component';
import { ChangePasswordComponent } from './components/user/change-password.component';
import { PlayerEditComponent } from './components/player/player-edit.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { GameEditComponent } from './components/game/game-edit.component';
import { GameDetailComponent } from './components/game/game-detail.component';
import { GameDetailDetailComponent } from './components/game/game-detail-detail.component';
import { PlayerDetailComponent } from './components/player/player-detail.component';
import { GameDetailEditComponent } from './components/game/game-detail-edit.component';
import { GameDetailTipEditComponent } from './components/game/game-detail-tip-edit.component';
import { RegisterComponent } from './components/user/register.component';
import { PageNotFoundComponent } from './components/pagenotfound/page-not-found.component';
import { AppMainComponent } from './app.main.component';
import { DashboardDemoComponent } from './components/dashboard/dashboarddemo.component';
import { RankingListComponent } from './components/ranking-list/ranking-list.component';


@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppMainComponent,
                children: [
                    { path: '', component: HomeComponent },
                    { path: 'dash', component: DashboardDemoComponent},
                    { path: 'login', component: LoginComponent },
                    { path: 'game', component: GameListComponent },
                    { path: 'player', component: PlayerListComponent },
                    { path: 'user', component: UserListComponent },
                    { path: 'change-password', component: ChangePasswordComponent },
                    { path: 'player/create', component: PlayerEditComponent },
                    { path: 'player/edit/:id', component: PlayerEditComponent },
                    { path: 'ranking', component: RankingComponent },
                    { path: 'new-ranking', component: RankingListComponent },
                    { path: 'game/create', component: GameEditComponent },
                    { path: 'game/:id', component: GameDetailComponent },
                    { path: 'game-detail-detail/:id', component: GameDetailDetailComponent },
                    { path: 'player-detail/:id', component: PlayerDetailComponent },
                    { path: 'gameDetail/create/:action/:gameId/:playerId', component: GameDetailEditComponent },
                    { path: 'gameDetail/tip/:gameId', component: GameDetailTipEditComponent }
                ]
            },
            { path: 'register', component: RegisterComponent },
            { path: '**', component: PageNotFoundComponent }]
            , { scrollPositionRestoration: 'enabled', useHash: true })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
