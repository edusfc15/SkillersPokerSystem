import { Component, Inject } from "@angular/core";
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { User } from "src/app/interfaces/user";

@Component({
  selector: 'change-password',
  templateUrl: 'change-password.component.html'  
})
export class ChangePasswordComponent {

    title: string;
    form: FormGroup;

    constructor(private router: Router,
      private fb: FormBuilder,
      private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string) {

      this.title = "New User Registration";

      // initialize the form
      this.createForm();

    }

    createForm() {
      this.form = this.fb.group({
        Username: ['', Validators.required],
        OldPassword: ['', Validators.required],
        Password: ['', Validators.required],
        ConfirmPassword: ['', Validators.required]
      }, {
          validator: this.passwordConfirmValidator
        });
    }

    onSubmit() {
      // build a temporary user object from form values
      var tempUser = <User>{};
      tempUser.Username = this.form.value.Username;
      tempUser.OldPassword = this.form.value.OldPassword;
      tempUser.ConfirmPassword = this.form.value.ConfirmPassword;

      var url = this.baseUrl + "api/user/changePassword";

      this.http
        .post<User>(url, tempUser)
        .subscribe(res => {
            var v = res;
            console.log("User " + v.Username + " has been changed password.");
            // redirect to login page
            this.router.navigate(["login"]);

        }, error => {

            this.form.setErrors({
              "changepw": "Erro ao trocar senha!"
            });
            console.log(error);
          })
    }

    onBack() {
      this.router.navigate(["home"]);
    }

    // custom validator to compare 
    //   the Password and passwordConfirm values.
    passwordConfirmValidator(control: FormControl): any {

      // retrieve the two Controls
      let p = control.root.get('Password');
      let pc = control.root.get('ConfirmPassword');

      if (p && pc) {
        if (p.value !== pc.value) {
          pc.setErrors(
            { "PasswordMismatch": true }
          );
        }
        else {
          pc.setErrors(null);
        }
      }
      return null;
    }

    // retrieve a FormControl
    getFormControl(name: string) {
      return this.form.get(name);
    }

    // returns TRUE if the FormControl is valid
    isValid(name: string) {
      var e = this.getFormControl(name);
      return e && e.valid;
    }

    // returns TRUE if the FormControl has been changed
    isChanged(name: string) {
      var e = this.getFormControl(name);
      return e && (e.dirty || e.touched);
    }

    // returns TRUE if the FormControl is invalid after user changes
    hasError(name: string) {
      var e = this.getFormControl(name);
      return e && (e.dirty || e.touched) && !e.valid;
    }

  
}
