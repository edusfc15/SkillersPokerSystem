import {Component, OnInit} from '@angular/core';
import {AppMainComponent} from './app.main.component';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {

    model: any[];

    constructor(public appMain: AppMainComponent) {}

    ngOnInit() {
        this.model = [
            {
                label: 'Favorites', icon: 'pi pi-home',
                items: [
                    {label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/']},
                    {label: 'Partidas', icon: 'pi pi-fw pi-home', routerLink: ['/game']},
                    {label: 'Jogadores', icon: 'pi pi-fw pi-home', routerLink: ['/player']},
                    {label: 'Ranking', icon: 'pi pi-fw pi-home', routerLink: ['/ranking']},
                    {label: 'Novo Ranking', icon: 'pi pi-fw pi-home', routerLink: ['/new-ranking']},
                    {label: 'Gerenciar', icon: 'pi pi-fw pi-home', routerLink: ['/game/create']},
                    {label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dash']},
                ]
            },
        ];
    }
}
