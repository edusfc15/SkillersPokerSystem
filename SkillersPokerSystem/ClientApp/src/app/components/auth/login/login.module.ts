import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';

@NgModule({
	imports: [
		CommonModule,
        ReactiveFormsModule,
        LoginRoutingModule,
        InputTextModule,
        PasswordModule,
        AppConfigModule,
        ButtonModule
	]
    ,
    declarations: [
        LoginComponent
    ]
})
export class LoginModule { }


