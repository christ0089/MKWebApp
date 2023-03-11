import { Component, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { first } from "rxjs/operators";
// import { AuthService } from "src/app/providers/Auth/AuthService";
import { EventEmitter } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  templateUrl: "register.component.html",
  styleUrls: ["register.component.scss"],
  selector: "register",
})
export class RegisterComponent implements OnInit {
  registerForm: UntypedFormGroup = this.formBuilder.group({
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    email: ["", Validators.required, Validators.email],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });
  loading = false;
  submitted = false;

  @Output() register = new EventEmitter();

  constructor(
    private formBuilder: UntypedFormBuilder,
    // private userService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // redirect to home if already logged in
  }

  ngOnInit() {
    this.registerForm
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  onSubmit() {
    console.log("Register");
    this.submitted = true;
    this.loading = true;
    // stop here if form is invalid
    if (this.registerForm.invalid) {
      this.loading = false;
      return;
    }

    const obj = {
      name:
        this.registerForm.value.firstName +
        " " +
        this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    // this.userService
    //   .registerFn(obj)
    //   .then(() => {
    //     this.loading =false;
    //     this.snackBar.open('El usuario se creo correctamente');
    //     this.register.emit(this.registerForm.value.data);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //     this.snackBar.open('Error: no se pudo registrar al usuario');
    //     this.loading = false;
    //   });
  }
}
