import {Component, OnInit} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import { version } from 'package.json';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    menuMode = 'static';

    colorScheme = 'light';

    menuTheme = 'layout-sidebar-darkgray';

    inputStyle = 'outlined';

    ripple: boolean;

    public version: string = version;

    constructor(private primengConfig: PrimeNGConfig) {
    }

    ngOnInit() {
        this.primengConfig.ripple = true;
    }
}
