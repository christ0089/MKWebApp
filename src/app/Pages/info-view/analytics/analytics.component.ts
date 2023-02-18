import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.sass'],
})
export class AnalyticsComponent implements OnInit {
  campaignOne: FormGroup;

  constructor() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const day = today.getDate();
    this.campaignOne = new FormGroup({
      start: new FormControl(new Date(year, month, day - 7)),
      end: new FormControl(new Date(year, month, day + 1)),
    });
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
        indexAxis:'y',
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
