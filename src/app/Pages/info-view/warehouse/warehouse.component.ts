import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { collection, doc, Firestore, setDoc } from '@firebase/firestore';
import { EMPTY, map, Observable, scheduled } from 'rxjs';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { IQuestion } from 'src/app/Models/question';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { environment } from 'src/environments/environment';
declare let mapboxgl: any;
@Component({
  selector: 'warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.sass'],
})
export class WarehouseComponent implements OnInit {
  questions: IQuestion[] = [];
  forms!: FormGroup[];
  warehouse$: Observable<any> = EMPTY;

  map: any;
  private marker: any;
  private coords = [];

  loading = false;

  constructor(
    private qcs: QuestionControlService,
    private auth: AuthService,
    private readonly warehouse: WarehouseService,
  ) {
    this.warehouse$ = this.warehouse.selectedWarehouse$.pipe(
      map((curr_warehouse) => {
        this.questions = this.qcs.warehouse_questionaire();
        if (!curr_warehouse) {
          return null;
        }
        const warehouse_data = {
          name: curr_warehouse?.name,
          alchohol_time: curr_warehouse.alchohol_time || [0,0],
          start_time: curr_warehouse.start_time  || [0,0],
          close_time: curr_warehouse.close_time  || [0,0],
        };

        const close_time = {
          "hours": warehouse_data.close_time[0],
          "mins": warehouse_data.close_time[1],
        };

        const start_time = {
          "hours": warehouse_data.start_time[0],
          "mins": warehouse_data.start_time[1],
        };

        const alchohol_time = {
          "hours": warehouse_data.alchohol_time[0],
          "mins": warehouse_data.alchohol_time[1],
        };

        const delivery = {
          min_payment: curr_warehouse.delivery?.min_payment || 0,
          min_fee: curr_warehouse.delivery?.min_fee || 0,
          max_fee: curr_warehouse.delivery?.max_fee || 0,
        };

        const warehouse_form_data = [warehouse_data, alchohol_time,start_time, close_time, delivery];

        this.forms = warehouse_form_data.map((w, i) => {
          const questions: QuestionBase<any>[] = this.qcs.mapToQuestion(
            this.questions[i].questions,
            w
          );
          return this.qcs.toFormGroup(questions);
        });

        if (
          this.auth.userData$.value.role !== 'admin' &&
          curr_warehouse?.name === 'General'
        ) {
          this.forms.map((form) => form.disable());
        }
        return curr_warehouse;
      })
    );

    this.warehouse$.subscribe();
  }

  ngOnInit(): void {
    mapboxgl.accessToken = environment.mapbox;
    this.map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v10',
      center: {
        lng: -102.5528,
        lat: 23.6345
      },
      zoom: 8,
      pitch: 55,
      container: 'mapbox',
      antialias: true,
    });

    this.map.on('load', async  () => {
      this.map.addSource('zones', {
        type: 'geojson',
        // Use a URL for the value for the `data` property.
        data: "https://raw.githubusercontent.com/christ0089/PrtyGeoJson/main/map%20(2).geojson",
      });
      this.map.addLayer({
        id: 'avail_zones',
        type: 'fill',
        source: 'zones', // reference the data source
        layout: {},
        paint: {
          'fill-color': '#e70de0', // blue color fill
          'fill-opacity': 0.1,
        },
      });
    });
  }

  async save() {
    const { name } = this.forms[0].value;
    const alchohol_time = Object.values(this.forms[1].value as number[])
    const start_time = Object.values(this.forms[2].value as number[])
    const close_time = Object.values(this.forms[3].value as number[])
    const { min_payment, min_fee, max_fee } = this.forms[4].value;

    const delivery = {
      min_payment: parseInt(min_payment),
      min_fee: parseInt(min_fee),
      max_fee: parseInt(max_fee),
    };
    this.loading = true;

    await this.warehouse.saveWarehouse(name, alchohol_time,close_time, start_time, delivery);
    this.loading = false;
  }

  async saveFormData(schedule: any) {
    this.loading = true;

    console.log(schedule);
    await this.warehouse.updateSchedule(schedule);
    this.loading = false;
  }
}
