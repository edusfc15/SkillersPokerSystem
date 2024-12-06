import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerRoutingModule } from './player-routing.module';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { DataViewModule } from 'primeng/dataview';
import { TabViewModule } from 'primeng/tabview';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlayerListComponent } from './player-list/player-list.component';
import { PlayerEditComponent } from './player-edit/player-edit.component';
import { PlayerDetailComponent } from './player-detail/player-detail.component';
import { RouterModule } from '@angular/router';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		InputNumberModule,
		ButtonModule,
		RippleModule,
		TabViewModule,
		DataViewModule,
		DropdownModule,
		InputSwitchModule,
		ReactiveFormsModule,
		RouterModule,
		PlayerRoutingModule
	],
	declarations:[
		PlayerListComponent,
		PlayerEditComponent,
		PlayerDetailComponent
	]
})
export class PlayerModule { }
