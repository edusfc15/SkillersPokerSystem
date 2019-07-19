import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID  } from '@angular/core';

import ptBr from '@angular/common/locales/pt';

import { AppComponent } from './components/app/app.component';
import { CommonModule, registerLocaleData, TitleCasePipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/user/register.component';
import { PageNotFoundComponent } from './components/pagenotfound/page-not-found.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthResponseInterceptor } from './services/auth.response.interceptor';
import { AuthService } from './services/auth.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoaderInterceptorService } from './services/loader.interceptor';

import { GameListComponent } from './components/game/game-list.component';
import { GameDetailComponent } from './components/game/game-detail.component';
import { GameDetailListComponent } from './components/game/game-detail-list.component';
import { GameDetailDetailComponent } from './components/game/game-detail-detail.component';
import { NavMenuComponent } from './components/navbar/nav-menu.component';
import { GameEditComponent } from './components/game/game-edit.component';
import { GameDetailEditComponent } from './components/game/game-detail-edit.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { PlayerListComponent } from './components/player/player-list.component';
import { PlayerEditComponent } from './components/player/player-edit.component';
import { PlayerDetailComponent } from './components/player/player-detail.component';
import { UserListComponent } from './components/user/user-list.component';
import { ChangePasswordComponent } from './components/user/change-password.component';
import { LoaderComponent } from './components/loader/loader.component';
import { GameStatus } from './services/game.status.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    PageNotFoundComponent,
    GameListComponent,
    GameDetailComponent,
    GameDetailListComponent,
    GameDetailDetailComponent,
    GameEditComponent,
    GameDetailEditComponent,
    NavMenuComponent,
    RankingComponent,
    PlayerListComponent,
    PlayerEditComponent,
    PlayerDetailComponent,
    UserListComponent,
    ChangePasswordComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'game', component: GameListComponent },
      { path: 'player', component: PlayerListComponent },
      { path: 'user', component: UserListComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'player/create', component: PlayerEditComponent },
      { path: 'player/edit/:id', component: PlayerEditComponent },
      { path: 'ranking', component: RankingComponent },
      { path: 'game/create', component: GameEditComponent },
      { path: 'game/:id', component: GameDetailComponent },
      { path: 'game-detail-detail/:id', component: GameDetailDetailComponent },
      { path: 'player-detail/:id', component: PlayerDetailComponent },
      { path: 'gameDetail/create/:action/:gameId/:playerId', component: GameDetailEditComponent },
      { path: 'register', component: RegisterComponent },
      { path: '**', component: PageNotFoundComponent }
    ])
  ],
  providers: [
	  GameStatus,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptorService,
      multi: true
    },    
    { provide: 'BASE_URL', useFactory: getBaseUrl },
    AuthService,
    TitleCasePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthResponseInterceptor,
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'pt' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

registerLocaleData(ptBr)
