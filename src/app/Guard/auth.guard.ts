import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../Services/Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log(!this.auth.isLoggedIn && !this.auth.isAdmin)
    console.log(!this.auth.isLoggedIn)
    console.log(!this.auth.isAdmin)
    if (!this.auth.isAdmin) {  
        this.router.navigateByUrl("/login");
        return false;
    }  
    return this.auth.isLoggedIn
  }
  
}
