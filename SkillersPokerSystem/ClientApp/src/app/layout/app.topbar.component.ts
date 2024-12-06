import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AppSidebarComponent } from './app.sidebar.component';
import { AuthService } from '../services/auth.service';
import { Route, Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopbarComponent {

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;

    constructor(public layoutService: LayoutService, public el: ElementRef,public auth: AuthService, private router: Router) { 
        this.printpath('', this.router.config);
    }
 
      printpath(parent: string, config: Route[]) {
        for (let i = 0; i < config.length; i++) {
          const route = config[i];
          console.log(parent + '/' + route.path);
          if (route.children) {
            const currentPath = route.path ? `${parent}/${route.path}` : parent;
            this.printpath(currentPath, route.children);
          }
        }
      }

    onLogoutClick(){
        console.log('aqui');
        this.auth.logout()
        console.log(this.router);
        
        this.router.navigate(['/auth/login']);
        
    }
    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onProfileButtonClick() {
        this.layoutService.showRightMenu();
    }

    onSearchClick() {
        this.layoutService.toggleSearchBar();
    }

    onRightMenuClick() {
        this.layoutService.showRightMenu();
    }

    get logo() {
        const logo = this.layoutService.config.menuTheme === 'white' || this.layoutService.config.menuTheme === 'orange' ? 'dark' : 'white';
        return logo;
    }

}
