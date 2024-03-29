import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnalyticsRoutingModule } from './analytics-routing.module';
import { AnalyticsComponent } from './analytics.component';
import { ComponentModule } from 'src/app/Components/components.module';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [AnalyticsComponent],
  imports: [
    CommonModule,
    AnalyticsRoutingModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    ComponentModule,
  ],
})
export class AnalyticsModule {}
