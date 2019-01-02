import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "game-detail-edit",
  templateUrl: './game-detail-edit.component.html'
})

export class GameDetailEditComponent {

  title: string;
  gameDetail: GameDetail;
  players: Player[];
  chosenPlayer: Player;
  gameDetailForm: FormGroup;
  routePlayerId: number;
  isBuyIn: boolean;
  routeGameId: number;

  editMode: boolean;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,

    @Inject('BASE_URL') private baseUrl: string) {


    this.gameDetail = <GameDetail>{};

    this.isBuyIn = this.activatedRoute.snapshot.params["action"] === 'buy-in';

    //get active players from the server
    this.http.get<Player[]>(this.baseUrl + "api/player/active")
      .subscribe(
        result => {
          this.players = result;
        }, error => console.log(error)
      );

    this.routePlayerId = +this.activatedRoute.snapshot.params["playerId"];

    // initialize the form
    this.createForm();

    this.routeGameId = +this.activatedRoute.snapshot.params["gameId"];


    if (this.editMode) {

    }
    else {
      this.gameDetail.GameId;
      this.title = "Adicionando Buy in";
    }
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
                PlayerId: this.routePlayerId,
                Value: [(this.isBuyIn) ? 5 : 0, (this.isBuyIn) ? Validators.min(5) : 0 ],
                ChipsTotal: [(this.isBuyIn) ? 0 : 0.25, (this.isBuyIn) ? 0 : Validators.min(0.25)],
              }
            )
          ])
      }
    );
  }



  addGameDetails() {
    this.gameDetails.push(this.fb.group({ PlayerId: '', ChipsTotal: 0, Value: 0 }));
  }

  deleteGameDetails(index) {
    this.gameDetails.removeAt(index);
  }


  onSubmit(gameDetails: FormArray) {

    var tempGameDetails = <GameDetail>{};

    var url = this.baseUrl + "api/gameDetail/addDetail/" + this.routeGameId;

    tempGameDetails = gameDetails.value;

    this.http
      .put<GameDetail>(url, tempGameDetails,)
      .subscribe(
      res => {
        this.gameDetail = res;
        this.router.navigate(["game/" + this.routeGameId]);
      }
      )

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
