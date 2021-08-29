import { Component, Inject } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, Validators, SelectControlValueAccessor } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { interval, Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { GameStatus } from "src/app/services/game.status.service";
import { Player } from "src/app/interfaces/player";
import { Game } from "src/app/interfaces/game";
import { GameDetail } from "src/app/interfaces/gameDetail";

@Component({
  selector: "game-edit",
  templateUrl: './game-edit.component.html'
})

export class GameEditComponent {
  title: string;
  game: Game;
  gameForm: FormGroup;
  clock: Observable<Date>;
  players: Player[];
  activeGame: Game;
  now : Date;
  sliderValue: number = 0;

  editMode: boolean;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private gameStatus: GameStatus,
    @Inject('BASE_URL') private baseUrl: string) {

    this.game = <Game>{};

    this.http.get<Game>(this.baseUrl + 'api/game/active')
      .subscribe(res => {
        this.activeGame = res;
        if (this.activeGame) {
          this.router.navigate(['game/' + this.activeGame.Id]);
          this.gameStatus.setGameStatus(true);
        } else {
          this.gameStatus.setGameStatus(false);
        }
      }
      );

    this.clock = interval(1000).pipe(
      map(tick => new Date()),
      share()
    )


    this.clock.subscribe(now => this.now = now);


    //get active players from the server
    this.http.get<Player[]>(this.baseUrl + "api/player/active")
      .subscribe(
        result => {
          this.players = result;
        }, error => console.log(error)
      );

    // initialize the form
    this.createForm();

  }

  get gameDetails() {
    return this.gameForm.get('gameDetailsArray') as FormArray;
  }

  createForm() {
    this.gameForm = this.fb.group(
      {
        gameDetailsArray: this.fb.array(
          [
            this.fb.group(
              {
                PlayerId: ['', Validators.required],
                Value: [5, Validators.min(5)]
              }
            )
          ])
      }
    );
  }

  addGameDetails() {
    this.gameDetails.push(this.fb.group({ PlayerId: '', Value: [5, Validators.min(5)] }));

  }

  deleteGameDetails(index) {
    this.gameDetails.removeAt(index);
  }

  onAddValue(value, index) {
    this.gameDetails.controls[index].value.Value += value;
  }

  onClear(value, index) {
    this.gameDetails.controls[index].value.Value = value;
  }

  startGame(gameDetails: FormArray) {

    var url = this.baseUrl + "api/gameDetail"
    var tempGameDetails = <GameDetail>{};
    tempGameDetails = <GameDetail>gameDetails.value;

    this.http
      .put<GameDetail>(url, tempGameDetails)
      .subscribe(res => {
        var v = res;

        this.router.navigate(["game/" + v.Id]);
        this.gameStatus.setGameStatus(true);
      }, error => console.log(error)

      );

  }

  onBack() {
    this.router.navigate(["home"]);
  }

  sliderChange(index, event) {
    //    this.gameDetails.controls[index].value.Value = event.value;

  }

  // retrieve a FormControl
  getFormControl(name: string) {
    return this.gameForm.get(name);
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
