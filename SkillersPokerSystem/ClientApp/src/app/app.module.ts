import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import ptBr from '@angular/common/locales/pt';

import { CommonModule, HashLocationStrategy, LocationStrategy,  registerLocaleData, TitleCasePipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { GameDetailTipEditComponent } from './components/game/game-detail-tip-edit.component';

import {DataViewModule} from 'primeng/dataview';
import {ButtonModule} from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import {DropdownModule} from 'primeng/dropdown';
import {DialogModule} from 'primeng/dialog';
import {InputTextModule} from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';

import { AppRoutingModule } from './app-routing.module';
import { AppMainComponent } from './app.main.component';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppComponent } from './app.component';
import { AppTopBarComponent } from './app.topbar.component';
import { AppFooterComponent } from './app.footer.component';
import { AppConfigComponent } from './app.config.component';
import { AppRightmenuComponent } from './app.rightmenu.component';
import { AppSearchComponent } from './app.search.component';
import { MenuService } from './app.menu.service';
import { BreadcrumbService } from './app.breadcrumb.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DashboardDemoComponent } from './components/dashboard/dashboarddemo.component';
import { ProductService } from './components/dashboard/productservice';
import { RankingListComponent } from './components/ranking-list/ranking-list.component';
import { InputNumberModule } from 'primeng/inputnumber';
import {SliderModule} from 'primeng/slider';


@NgModule({
  declarations: [
    AppMainComponent,
    AppTopBarComponent,
    AppMenuComponent,
    AppMenuitemComponent,
    AppFooterComponent,
    AppConfigComponent,
    AppRightmenuComponent,
    AppSearchComponent,
    AppComponent,
    HomeComponent,
    DashboardDemoComponent,
    LoginComponent,
    RegisterComponent,
    PageNotFoundComponent,
    GameListComponent,
    GameDetailComponent,
    GameDetailListComponent,
    GameDetailDetailComponent,
    GameEditComponent,
    GameDetailEditComponent,
    GameDetailTipEditComponent,
    NavMenuComponent,
    RankingComponent,
    PlayerListComponent,
    PlayerEditComponent,
    PlayerDetailComponent,
    UserListComponent,
    ChangePasswordComponent,
    LoaderComponent,
    RankingListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ButtonModule,
    ChartModule,
    DataViewModule,
    DialogModule,
    DropdownModule,
    PanelModule,
    InputTextModule,
    InputNumberModule,
    SliderModule,
    InputSwitchModule,
    MenuModule,
    TableModule,
    RadioButtonModule,
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
  ],
  providers: [
    MenuService,
    BreadcrumbService,
    ProductService,
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
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: LocationStrategy, useClass: HashLocationStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

registerLocaleData(ptBr)
