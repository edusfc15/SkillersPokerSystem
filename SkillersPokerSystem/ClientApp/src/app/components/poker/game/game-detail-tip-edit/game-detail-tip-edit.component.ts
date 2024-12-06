import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { GameDetail } from "src/app/interfaces/gameDetail";
import { Player } from "src/app/interfaces/player";

@Component({
  selector: "game-detail-tip-edit",
  templateUrl: './game-detail-tip-edit.component.html'
})

export class GameDetailTipEditComponent {

  title: string;
  gameDetail: GameDetail;
  players: Player[];
  gameDetailForm: FormGroup;
  routePlayerId: number;
  routeGameId: number;
  tipPlayer: Player;

  editMode: boolean;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,

    @Inject('BASE_URL') private baseUrl: string) {

    this.gameDetail = <GameDetail>{};

    this.tipPlayer = <Player>{};
    this.tipPlayer.Id = 0;
    this.tipPlayer.Name = 'Capilé';
    this.tipPlayer.IsActive = true;

    // initialize the form
    this.createForm();

    this.routeGameId = +this.activatedRoute.snapshot.params["gameId"];

    this.gameDetail.GameId;
    this.title = "Adicionando Capilé";

  }

  get gameDetails() {
    return this.gameDetailForm.get('gameDetailsArray') as FormArray;
  }

  createForm() {

    this.gameDetailForm = this.fb.group(
      {
        gameDetailsArray: this.fb.array(
          [
            this.fb.group(
              {
                PlayerId: this.tipPlayer.Id,
                Tip: [0, Validators.min(0.25)]
              }
            )
          ])
      }
    );
  }

  onSubmit(gameDetails: FormArray) {

    var tempGameDetails = <GameDetail>{};

    var url = this.baseUrl + "api/gameDetail/addDetail/" + this.routeGameId;

    tempGameDetails = gameDetails.value;

    console.log(tempGameDetails);

    this.http
      .put<GameDetail>(url, tempGameDetails)
      .subscribe(
        (res) => {
          this.gameDetail = res;
          this.router.navigate(["game/" + this.routeGameId]);
        })


  }

  onAddValue(value:number, index:number) {
    this.gameDetails.controls[index].value.Tip += value;
  }

  onClear(value:number, index:number) {
    this.gameDetails.controls[index].value.Tip = value;
  }

  onBack() {
    this.router.navigate(["home"]);
  }

  // retrieve a FormControl
  getFormControl(name: string) {
    return this.gameDetailForm.get(name);
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
