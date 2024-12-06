import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PokerDashboardComponent } from './poker.dashboard.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: PokerDashboardComponent }
	])],
	exports: [RouterModule]
})
export class PokerDashboardRoutigModule { }
