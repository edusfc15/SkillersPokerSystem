import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', data: {breadcrumb: 'Poker Dashboard'}, loadChildren: () => import('./poker/poker.dashboard.module').then(m => m.PokerDashboardModule) },
    ])],
    exports: [RouterModule]
})
export class DashboardsRoutingModule { }
