import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RankingListComponent } from './ranking-list/ranking-list.component';
import { RankingComponent } from './ranking.component';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RankingRoutingModule } from './ranking-routing.module';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
	imports: [
		CommonModule,
		TableModule,
		DropdownModule,
		FormsModule,
		ReactiveFormsModule,
		RankingRoutingModule,
		InputSwitchModule
	],
    declarations: [
		RankingComponent,
		RankingListComponent
	],
	providers:[],
	exports:[RankingComponent]
})
export class RankingModule { }
