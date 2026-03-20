import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Player } from "src/app/interfaces/player";


@Component({
  selector: 'player-edit',
  templateUrl: 'player-edit.component.html',
  styleUrls:['player-edit.component.css']
})
export class PlayerEditComponent {


  player: Player;
  form: FormGroup;
  editMode: boolean;


  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    @Inject('BASE_URL') private baseUrl: string
  ) {

    this.player = <Player>{};

    this.createForm();

    var id = +this.activatedRoute.snapshot.params["id"];
    if (id) {
      this.editMode = true;

      var url = this.baseUrl + "api/player/" + id;
      this.http.get<Player>(url).subscribe(result => {
        this.player = result;

        this.updateForm();

      }, error => console.error(error));
    }
    else {
      this.editMode = false;
    }


  }

  createForm() {
    this.form = this.fb.group({
      Name: ['', Validators.required],
      IsActive: true,
      ImageUrl: ''
    });
  }

  updateForm() {
    this.form.setValue({
      Name: this.player.Name,
      IsActive: this.player.IsActive || true,
      ImageUrl: this.player.ImageUrl
    });
  }

  onSubmit() {

    
    var tempPlayer = <Player>{};
    tempPlayer.Name = this.form.value.Name;
    tempPlayer.IsActive = this.form.value.IsActive;
    tempPlayer.ImageUrl = this.form.value.ImageUrl;


    var url = this.baseUrl + "api/player";

    if (this.editMode) {

      tempPlayer.Id = this.player.Id;

      this.http
        .post<Player>(url, tempPlayer)
        .subscribe(res => {
          this.player = res;
          this.router.navigate(["player"]);
        }, error => console.log(error));
    }
    else {
      this.http
        .put<Player>(url, tempPlayer)
        .subscribe(res => {
          var v = res;
          this.router.navigate(["player"]);
        }, error => console.log(error));
    }
  }

  onBack() {
    this.router.navigate(["player"]);
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
