import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/Guard/auth.guard';

import { UsersComponent } from '../users/users.component';
import { AdsComponent } from './ads/ads.component';
import { BrandsComponent } from './brands/brands.component';
import { CouponsComponent } from './coupons/coupons.component';
import { InfoViewComponent } from './info-view.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { OrdersComponent } from './orders/orders.component';
import { ProductsComponent } from './products/products.component';
import { WarehouseComponent } from './warehouse/warehouse.component';

const routes: Routes = [
  {
    path: '',
    component: InfoViewComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'orders', component: OrdersComponent },
      { path: 'warehouse', component: WarehouseComponent },
      //  { path: 'products', component: ProductsComponent },
      {
        path: 'analytics',
        loadChildren: () =>
          import('./analytics/analytics.module').then((m) => m.AnalyticsModule),
      },
      { path: 'brands', component: BrandsComponent },
      { path: 'ads', component: AdsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'coupons', component: CouponsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InfoViewRoutingModule {}
