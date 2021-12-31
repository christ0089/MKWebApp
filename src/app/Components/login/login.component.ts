import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { first } from "rxjs/operators";
// import { AuthService } from "src/app/providers/Auth/AuthService";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/Services/Auth/auth.service";

@Component({
  templateUrl: "login.component.html",
  styleUrls: ["login.component.scss"],
  selector: "login",
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = this.formBuilder.group({
    email: ["", Validators.required],
    password: ["", Validators.required],
  });
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  login() {
    const user = this.loginForm.value;
    console.log(user);
    this.auth.emailAuth(user.email, user.password).then(() => {
      this.router.navigateByUrl("/home")
    });
  }

  emailSent() {
    this.snackbar
      .open("Te enviamos un correo para que cambies tu contraseña")
      ._dismissAfter(3000);
    //  this.auth.afAuth.auth.sendPasswordResetEmail(this.f.email.value).catch(e => console.error(e));
  }

  pwdVerfifyPassword() {
    this.snackbar
      .open(
        "Tu cuenta se activado. Te enviamos un correo para que cambies tu contraseña"
      )
      ._dismissAfter(3000);
    //  this.auth.afAuth.auth.sendPasswordResetEmail(this.f.email.value).catch(e => console.error(e));
  }


}
