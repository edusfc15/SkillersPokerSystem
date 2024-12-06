import { OnInit } from '@angular/core';
import { Component } from '@angular/core';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                icon: 'pi pi-home',
                items: [
                    {
                        label: 'Inicio',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/']
                    },
                    {
                        label: 'Partidas',
                        icon: 'pi pi-fw pi-image',
                        routerLink: ['/game']
                    }
                    ,
                    {
                        label: 'Jogadores',
                        icon: 'pi pi-fw pi-image',
                        routerLink: ['/player']
                    }
                ]
            },
            {
                label: 'Auth',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        routerLink: ['/auth/login']
                    }
  
                ]
            },

        ];
    }
}
