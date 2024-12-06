import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRoutingModule } from './game-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TimelineModule } from 'primeng/timeline';
import { TableModule } from 'primeng/table';
import { GameDetailComponent } from './game-detail/game-detail.component';
import { GameEditComponent } from './game-edit/game-edit.component';
import { GameDetailEditComponent } from './game-detail-edit/game-detail-edit.component';
import { GameDetailListComponent } from './game-detail-list/game-detail-list.component';
import { GameDetailOverviewComponent } from './game-detail-overview/game-detail-overview.component';
import { GameDetailTipEditComponent } from './game-detail-tip-edit/game-detail-tip-edit.component';
import { GameListComponent } from './game-list/game-list.component';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { GameStatus } from 'src/app/services/game.status.service';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
	imports: [
		GameRoutingModule,
		CommonModule,
		ReactiveFormsModule,
        RouterModule,
        TimelineModule,
		TableModule,
		DropdownModule,
		SliderModule,
		CardModule,
		ButtonModule,
		InputTextModule

	],
	declarations: [
		GameDetailComponent,
		GameDetailEditComponent,
		GameDetailListComponent,
		GameDetailOverviewComponent,
		GameDetailTipEditComponent,
		GameEditComponent,
		GameListComponent
	],
	providers:[
		GameStatus
	]
})
export class GameModule { }
