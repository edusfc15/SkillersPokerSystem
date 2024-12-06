import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangePasswordComponent } from './change-password.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
        ReactiveFormsModule
	],
	declarations: [
		ChangePasswordComponent
	]
})
export class ChangePasswordModule { }
