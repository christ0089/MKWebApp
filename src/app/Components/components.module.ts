import { NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DynamicFormQuestionComponent } from "./question/question.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { WarehouseComponent } from './warehouse/warehouse.component';
import { MatIconModule } from "@angular/material/icon";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule
  ],
  declarations: [DynamicFormQuestionComponent, WarehouseComponent],
  providers: [],
  exports: [DynamicFormQuestionComponent, WarehouseComponent]
})
export class ComponentModule {}
