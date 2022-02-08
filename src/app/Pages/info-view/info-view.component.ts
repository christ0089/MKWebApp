import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { ScriptService } from 'src/app/Services/script.service';
import { Role } from '../users/users.component';

@Component({
  selector: 'app-info-view',
  templateUrl: './info-view.component.html',
  styleUrls: ['./info-view.component.sass']
})
export class InfoViewComponent implements OnInit {

  role!: Role; 
  constructor(
    private readonly auth: AuthService,
    private readonly scriptService: ScriptService,
    private readonly router: Router
  ) { 
    this.scriptService.loadScript("mapbox");
    this.role = this.auth.userData$.value.role
  }

  ngOnInit(): void {
  }

  signOut() {
    this.auth.signOut().then(() => {
      return this.router.navigateByUrl("/login");
    })
  }

}
