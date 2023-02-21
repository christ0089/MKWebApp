import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserRoles } from 'src/app/Services/Auth/auth.service';
import { ScriptService } from 'src/app/Services/script.service';


@Component({
  selector: 'app-info-view',
  templateUrl: './info-view.component.html',
  styleUrls: ['./info-view.component.sass']
})
export class InfoViewComponent implements OnInit {

  role!: UserRoles;
  menuContainer!: any[];
  constructor(
    private readonly auth: AuthService,
    private readonly scriptService: ScriptService,
    private readonly router: Router
  ) { 
    this.scriptService.loadScript("mapbox");
    this.role = this.auth.userData$.value.role
    this.menuContainer = this.menu(this.role as UserRoles);
  }

  ngOnInit(): void {
  }

  signOut() {
    this.auth.signOut().then(() => {
      return this.router.navigateByUrl("/login");
    })
  }

  menu(role: UserRoles) {
    switch (role) {
      case 'admin':
      case 'zone_admin':
        return [
          {
            route: 'analytics',
            name: 'Analitica',
          },
          {
            route: 'warehouse',
            name: 'Centro de Distribucion',
          },
          {
            route: 'brands',
            name: 'Brands',
          },
          {
            route: 'orderTracking',
            name: 'Rastreo de Ordenes',
          },
          {
            route: 'ads',
            name: 'Anuncios',
          },
          {
            route: 'orders',
            name: 'Ordenes',
          },
          {
            route: 'products',
            name: 'Inventario',
          },
          {
            route: 'notifications',
            name: 'Notificaciones',
          },
          {
            route: 'reservations',
            name: 'Reservaciones',
          },
          {
            route: 'coupons',
            name: 'Cupones',
          },
        ];
      case 'service_admin':
        return [
          {
            route: 'analytics',
            name: 'Analitica',
          },
          {
            route: 'products',
            name: 'Inventario',
          },
          {
            route: 'reservations',
            name: 'Reservaciones',
          },
          {
            route: 'orders',
            name: 'Ordenes',
          },
        ];
      default:
        return [];
    }
  }

}
