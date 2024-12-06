import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokerDashboardComponent } from './poker.dashboard.component';
import { PokerDashboardRoutigModule } from './poker.dashboard-routing.module';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { RankingModule } from '../../ranking/ranking.module';

@NgModule({
	imports: [
		CommonModule,
		PokerDashboardRoutigModule,
		ButtonModule,
		RippleModule,
		DropdownModule,
		FormsModule,
		TableModule,
		ChartModule,
        MenuModule,
		RankingModule
	],
	declarations: [PokerDashboardComponent]
})
export class PokerDashboardModule { }
