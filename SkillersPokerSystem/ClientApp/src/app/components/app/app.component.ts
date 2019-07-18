import { Component } from '@angular/core';
import { HTTPStatus } from '../../services/rxjs/HTTPStatus.service';

import { version } from '../../../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public version: string = version;

  title = 'ClientApp';
  HTTPActivity: boolean;
  constructor(/*private httpStatus: HTTPStatus*/) {
    //this.httpStatus.getHttpStatus().subscribe((status: boolean) => { this.HTTPActivity = status; console.log(status) });
  }
}
