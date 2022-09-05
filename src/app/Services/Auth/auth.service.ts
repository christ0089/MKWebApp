import { Injectable, Optional } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { ApplicationVerifier, signInWithEmailAndPassword, signInWithPhoneNumber, signOut, updateCurrentUser, User, UserCredential } from "@firebase/auth";
import { authState } from "rxfire/auth";
import { BehaviorSubject, EMPTY, map, Observable, switchMap } from "rxjs";
import { UserService } from "../user.service";


export type UserRoles = "admin" | "zone_admin" | "service_admin" | "driver";
export type UserStatus = "available" | "in-transit";
export interface UserData {
  name: string,
  role: UserRoles,
  img: string,
  status: UserService,
  warehouse_id: string | string[]
  email: string,
  phone: string,
  uid: string
  id?: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public readonly user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public readonly userData$: BehaviorSubject<any> = new BehaviorSubject<UserData| null>(null);
  public readonly auth$: Observable<any> = EMPTY;

  constructor(
    private readonly auth: Auth, 
    private readonly userService: UserService) {
    this.auth$ = authState(this.auth).pipe(switchMap((user) => {
      if (user) {
        this.user.next(user);
        return this.userService.loadUserData(user.uid).pipe(
          map((_userData: any) => {
            if (_userData == null) {
              return null;
            }
            return {
              uid: user.uid,
              ..._userData
            };
          })
        );
      } else {
        return EMPTY;
      }
    })
    );
    this.auth$.subscribe((user) => {
      this.userData$.next(user)
    })
  }

  get isLoggedIn() {
    if (this.user.value == null) {
      return false;
    } else {
      return true;
    }
  }

  get isServiceAdmin() {
    const user = this.userData$.value
    if (user === null) {
      return false;
    }
    if (user.role === "service_admin") {
      return true;
    } else {
      return false;
    }
  }

  get isZoneAdmin() {
    const user = this.userData$.value
    if (user === null) {
      return false;
    }
    if (user.role === "zone_admin") {
      return true;
    } else {
      return false;
    }
  }

  get isAdmin() {
    const user = this.userData$.value
    if (user === null) {
      return false;
    }
    if (this.isZoneAdmin || this.isServiceAdmin || this.isSuperAdmin) {
      return true;
    } else {
      return false;
    }
  }

  get isSuperAdmin() {
    const user = this.userData$.value
    if (user === null) {
      return false;
    }
    if (user.role === "admin") {
      return true;
    } else {
      return false;
    }
  }

  // get isLoggedIn(): boolean {
  //   const user = JSON.parse(localStorage.getItem("user"));
  //   return user !== null && user.emailVerified !== false ? true : false;
  // }

  signOut() {
    return signOut(this.auth);
  }

  phoneAuth(phone: string, captcha: ApplicationVerifier) {
    return signInWithPhoneNumber(this.auth, phone, captcha);
  }

  emailAuth(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }


  setUserData() {
    //  (this.user.value as User) = { displayName: data.name + data.lname1 };
    return updateCurrentUser(this.auth, this.user.value);
  }
}
