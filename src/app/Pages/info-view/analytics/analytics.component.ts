import { Component, OnInit } from '@angular/core';
import { Functions } from '@angular/fire/functions';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import Chart from 'chart.js/auto';
import { httpsCallable } from 'firebase/functions';
import { combineLatest, map, tap } from 'rxjs';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.sass'],
})
export class AnalyticsComponent implements OnInit {
  campaignOne: UntypedFormGroup;

  constructor(
    private readonly functions: Functions,
    private readonly warehouse: WarehouseService
  ) {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const day = today.getDate();
    this.campaignOne = new UntypedFormGroup({
      start: new UntypedFormControl(new Date(year, month, day - 7)),
      end: new UntypedFormControl(new Date(year, month, day + 1)),
    });


    combineLatest([
      this.campaignOne.valueChanges,
      this.warehouse.selectedWarehouse$
    ])
    .pipe(map(([values, warehouse]) => {
      if (!warehouse) { return [] }
      const dateRanges: string[] = [values.start, values.end]
      return this.eventData("ticket_data", dateRanges, warehouse.id)
    })).subscribe(console.log)
  }

  eventData(event: string, date: string[], warehouse_id: string) {
    const prodFunction = httpsCallable(this.functions, 'analyticsActionsFunc', {
      timeout: 15000
    });
    const prod$ = prodFunction({
      event,
      eventRange: date,
      warehouse_id
    });
    return prod$
  }

  ngOnInit(): void {
    const data = {
      labels: ['Tarjeta', 'Efectivo'],
      datasets: [
        {
          label: 'Compras',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            '#f70486',
            '#f7e304',
          ],
          borderRadius: 20,
          borderWidth: 1,

        },
      ],
    };

    this.buildLineChart('bar', 'myChart', data);
  }

  buildLineChart(chartType: 'bar' | 'line', el: string, avgData: any) {
    const canvas = <HTMLCanvasElement>document.getElementById(el);
    const ctx: any = canvas.getContext('2d');
    const myChart = new Chart(ctx, {
      type: chartType,
      data: avgData,
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        scales: {
          y: {

            stacked: true
          },
          x: {
            beginAtZero: true
          },
        },
      },
    });
  }
}
