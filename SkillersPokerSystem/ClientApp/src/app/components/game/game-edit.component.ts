import { Component, Inject } from "@angular/core";
import { FormGroup, FormBuilder, FormArray, Validators, SelectControlValueAccessor } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { interval, Observable } from "rxjs";
import { map, share } from "rxjs/operators";

@Component({
  selector: "game-edit",
  templateUrl: './game-edit.component.html'
})

export class GameEditComponent {
  title: string;
  game: Game;
  gameForm: FormGroup;
  clock:  Observable<Date>;
  players: Player[];
  activeGame: Game;
  date: string;
  time: string;
  now;

  editMode: boolean;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,

    @Inject('BASE_URL') private baseUrl: string) {

    this.game = <Game>{};

    this.http.get<Game>(this.baseUrl + 'api/game/active')
      .subscribe(res => {
        this.activeGame = res;
        if (this.activeGame) {
          this.router.navigate(['game/' + this.activeGame.Id]);
        }
      }
    );


    this.clock = interval(1000).pipe(
      map(tick => new Date() ),
      share()
    )
    this.now = Date.now();

    var optionsDate = {
      year: "numeric",
      month: "2-digit",
      day: "numeric"
    };

    var optionsTime = {
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    };

    this.clock.subscribe(date => this.date = date.toLocaleString('pt-br', optionsDate));
    this.clock.subscribe(time => this.time = time.toLocaleString('pt-br', optionsTime));

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
                Value: [5, Validators.min(5) ]
              }
            )
          ])
      }
    );
  }


  addGameDetails() {
    this.gameDetails.push(this.fb.group({ PlayerId: '', Value: [5, Validators.min(5) ] }));

  }

  deleteGameDetails(index) {
    this.gameDetails.removeAt(index);
  }


  startGame(gameDetails: FormArray) {

   var url = this.baseUrl + "api/gameDetail"

    var tempGameDetails = <GameDetail>{};

    tempGameDetails = gameDetails.value;
    
   this.http
       .put<Game>(url, tempGameDetails)
     .subscribe(res => {
       var v = res;
       this.router.navigate(["game/" + v.Id]);
     }, error => console.log(error));

  }

  onBack() {
    this.router.navigate(["home"]);
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
