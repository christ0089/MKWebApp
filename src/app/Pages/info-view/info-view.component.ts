import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/Auth/auth.service';

@Component({
  selector: 'app-info-view',
  templateUrl: './info-view.component.html',
  styleUrls: ['./info-view.component.sass']
})
export class InfoViewComponent implements OnInit {

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
  }

  signOut() {
    this.auth.signOut().then(() => {
      return this.router.navigateByUrl("/login");
    })
  }

}
