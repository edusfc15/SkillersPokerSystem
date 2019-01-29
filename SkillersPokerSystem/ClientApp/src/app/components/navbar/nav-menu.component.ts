import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from "@angular/router";

@Component({
  selector: 'nav-menu',
  templateUrl: './nav-menu.component.html'
})
export class NavMenuComponent implements OnInit {

  navbarCollapsed: boolean;

  constructor(
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.navbarCollapsed = true;

  }


  logout(): boolean {
    // logs out the user, then redirects him to Home View.
    if (this.auth.logout()) {
      this.router.navigate([""]);
    }
    return false;
  }


}
