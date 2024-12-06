import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RankingListComponent } from './ranking-list/ranking-list.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: RankingListComponent} 
    ])],
    exports: [RouterModule]
})
export class RankingRoutingModule { }
