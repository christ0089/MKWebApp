import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './Guard/auth.guard';

const routes: Routes = [
  { path: '', loadChildren: () => import('./Pages/main/main.module').then(m => m.MainModule) },
  { path: 'login', loadChildren: () => import('./Pages/auth/auth.module').then(m => m.AuthModule) },
  { path: "home", canActivate: [AuthGuard], loadChildren: () => import('./Pages/info-view/info-view.module').then(m => m.InfoViewModule) },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
