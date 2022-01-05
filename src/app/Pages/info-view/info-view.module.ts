import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfoViewRoutingModule } from './info-view-routing.module';
import { MatSidenavModule} from '@angular/material/sidenav'
import { InfoViewComponent } from './info-view.component';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { OrdersComponent } from './orders/orders.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { CdkTableModule } from '@angular/cdk/table';
import { ProductsComponent } from './products/products.component';
import { ComponentModule } from 'src/app/Components/components.module';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { MatIconModule } from '@angular/material/icon';
import { BrandsComponent } from './brands/brands.component';
import { MatSelectModule } from '@angular/material/select';
import { AuthGuard } from 'src/app/Guard/auth.guard';
import { CouponsComponent } from './coupons/coupons.component';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WarehouseComponent } from './warehouse/warehouse.component';

@NgModule({
  declarations: [
    InfoViewComponent,
    OrdersComponent,
    ProductsComponent,
    BrandsComponent,
    CouponsComponent,
    WarehouseComponent
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
    MatIconModule,
    MatFormFieldModule,
    MatInputModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    InfoViewRoutingModule,
    ComponentModule
  ],
  bootstrap: [
    InfoViewComponent,
    ProductsComponent
  ],
  providers: [
    QuestionControlService,
    AuthGuard,
    WarehouseService
  ]
})
export class InfoViewModule { }
