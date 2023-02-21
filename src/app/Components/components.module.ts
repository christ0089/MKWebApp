import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicFormQuestionComponent } from './question/question.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatListModule } from '@angular/material/list';
import { DragableListComponent } from './dragable-list/dragable-list.component';
import { DragableCircleComponent } from './dragable-circle/dragable-circle.component';
import { DragrableProductListComponent } from './dragrable-product-list/dragrable-product-list.component';
import { ProductComponent } from './product/product.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DragableHorizontalListComponent } from './dragable-horizontal-list/dragable-horizontal-list.component';
import { MapComponent } from './map/map.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    DragDropModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatRadioModule,
    MatListModule,
    MatDatepickerModule,
  ],
  declarations: [
    DynamicFormQuestionComponent,
    WarehouseComponent,
    DragableListComponent,
    DragableCircleComponent,
    DragrableProductListComponent,
    ProductComponent,
    DragableHorizontalListComponent,
    MapComponent
  ],
  providers: [],
  exports: [
    DynamicFormQuestionComponent,
    WarehouseComponent,
    DragableListComponent,
    DragableCircleComponent,
    DragrableProductListComponent,
    DragableHorizontalListComponent,
    ProductComponent,
    MapComponent
  ],
})
export class ComponentModule {}
