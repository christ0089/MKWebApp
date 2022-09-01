import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { CdkTableModule } from '@angular/cdk/table';

import { ComponentModule } from 'src/app/Components/components.module';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';

import { AuthGuard } from 'src/app/Guard/auth.guard';

import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { ScriptService } from 'src/app/Services/script.service';

import { InfoViewComponent } from './info-view.component';
import { InfoViewRoutingModule } from './info-view-routing.module';
import { ProductsComponent } from './products/products.component';
import { CouponsComponent } from './coupons/coupons.component';
import { WarehouseComponent } from './warehouse/warehouse.component'
import { BrandsComponent } from './brands/brands.component';;
import { UsersComponent } from '../users/users.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { AdsComponent } from './ads/ads.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OrdersComponent } from './orders/orders.component';
import { RepresentativesComponent } from './representatives/representatives.component';
import { ReservationsComponent } from '../reservations/reservations.component';

@NgModule({
  declarations: [
    InfoViewComponent,
    OrdersComponent,
    ProductsComponent,
    BrandsComponent,
    UsersComponent,
    ReservationsComponent,
    CouponsComponent,
    WarehouseComponent,
    AdsComponent,
    NotificationsComponent,
    RepresentativesComponent
],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatListModule,
    MatTabsModule,
    // Table Dependencies
    MatTableModule,
    MatSortModule,
    MatSelectModule,
    CdkTableModule,
    MatChipsModule,
    MatIconModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    // CDK
    DragDropModule,
    //
    InfoViewRoutingModule,
    ComponentModule,
  ],
  bootstrap: [InfoViewComponent],
  providers: [
    QuestionControlService,
    ScriptService,
    WarehouseService,
    AuthGuard,
  ],
})
export class InfoViewModule {}
