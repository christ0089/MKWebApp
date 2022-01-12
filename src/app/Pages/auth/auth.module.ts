import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthComponent } from './auth.component';
import { LoginComponent } from 'src/app/Components/login/login.component';
import { RegisterComponent } from 'src/app/Components/register/register.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from 'src/app/Services/Auth/auth.service';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatButtonModule,
    MatInputModule,
    MatGridListModule,
    RouterModule.forChild(routes),
  ],
  declarations: [AuthComponent, RegisterComponent, LoginComponent],
  providers: [AuthService],
})
export class AuthModule {}
