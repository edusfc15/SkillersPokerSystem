
import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'user-list',
  templateUrl: 'user-list.component.html'
})
export class UserListComponent implements OnInit {

  users: User[]; 

  constructor(
    private http: HttpClient,
    public auth: AuthService,
    @Inject('BASE_URL') private baseUrl: string
  ) {}

  ngOnInit() {
    var url = this.baseUrl + '/api/user/getAll';

    this.http.get<User[]>(url).subscribe(
      res => {
        this.users = res;
        console.log(this.users);
      }
    );

  }



}
