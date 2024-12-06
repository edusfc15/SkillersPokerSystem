import { LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigModule } from './config/app.config.module';
import { AppLayoutComponent } from './app.layout.component';
import { AppBreadcrumbComponent } from './app.breadcrumb.component';
import { AppSidebarComponent } from './app.sidebar.component';
import { AppTopbarComponent } from './app.topbar.component';
import { AppRightMenuComponent } from './app.rightmenu.component';
import { AppMenuComponent } from './app.menu.component';
import { AppMenuitemComponent } from './app.menuitem.component';
import { AppSearchComponent } from './app.search.component';
import { AppFooterComponent } from './app.footer.component';
import { HashLocationStrategy, LocationStrategy, TitleCasePipe, registerLocaleData } from '@angular/common';
import { LoaderInterceptorService } from '../services/loader.interceptor';
import { AuthService } from '../services/auth.service';
import { AuthInterceptor } from '../services/auth.interceptor';
import { AuthResponseInterceptor } from '../services/auth.response.interceptor';
import localePTBR from '@angular/common/locales/pt'

registerLocaleData(localePTBR)

@NgModule({
    declarations: [
        AppLayoutComponent,
        AppBreadcrumbComponent,
        AppSidebarComponent,
        AppTopbarComponent,
        AppRightMenuComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        AppSearchComponent,
        AppFooterComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        InputTextModule,
        SidebarModule,
        BadgeModule,
        RadioButtonModule,
        InputSwitchModule,
        ButtonModule,
        TooltipModule,
        RippleModule,
        MenuModule,
        RouterModule,
        DropdownModule,
        DividerModule,
        AppConfigModule,
        DialogModule,
        StyleClassModule
    ],providers:[
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
          { provide: LOCALE_ID, useValue: 'pt-BR' },
          { provide: LocationStrategy, useClass: HashLocationStrategy}
    ]
})
export class AppLayoutModule { }

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
  }