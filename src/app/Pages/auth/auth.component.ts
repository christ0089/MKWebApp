import { Component, OnInit } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  public isMobile: boolean = false;
  selectedTab = '0';
  constructor(
    breakpointObserver: BreakpointObserver,
    private router: Router,
) {
    breakpointObserver.observe([
      Breakpoints.Handset
    ]).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  registerComplete() {
    this.selectedTab = '0';
  }

  ngOnInit() {
  }

}
