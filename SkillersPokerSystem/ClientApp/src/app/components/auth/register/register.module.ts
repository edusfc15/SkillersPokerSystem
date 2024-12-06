import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	imports: [
		CommonModule,
        ReactiveFormsModule
	],
	declarations: [
		RegisterComponent
	]
})
export class RegisterModule { }
