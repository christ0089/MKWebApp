import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { collection, doc, Firestore, setDoc } from '@firebase/firestore';
import { EMPTY, map, Observable } from 'rxjs';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { IQuestion } from 'src/app/Models/question';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

@Component({
  selector: 'warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.sass'],
})
export class WarehouseComponent implements OnInit {
  questions: IQuestion[] = [];
  forms!: FormGroup[];
  warehouse$ : Observable<any> = EMPTY
  loading = false;

  constructor(
    private qcs: QuestionControlService,
    private readonly warehouse: WarehouseService,
    private readonly auth: AuthService
  ) {

    this.warehouse$ = this.warehouse.selectedWarehouse$.pipe(map((curr_warehouse) => {


      this.questions = this.qcs.warehouse_questionaire();
      if (!curr_warehouse) {
        return null
      }
      const warehouse_data = {
        name: curr_warehouse?.name,
      };
      const delivery = {
        min_payment: curr_warehouse.delivery?.min_payment || 0,
        min_fee: curr_warehouse.delivery?.min_fee || 0,
        max_fee: curr_warehouse.delivery?.max_fee || 0,
      };
  
      const warehouse_form_data = [
        warehouse_data,
        delivery
      ]
  
      this.forms = warehouse_form_data.map((w,i) => {
        const questions: QuestionBase<any>[] = this.qcs.mapToQuestion(
          this.questions[i].questions,
          w
        );
        return this.qcs.toFormGroup(questions);
      });

      if (auth.userData$.value.role !== "admin" && curr_warehouse?.name === "General") {
        this.forms.map(form => form.disable())
      }
      return null
    }));

    this.warehouse$.subscribe()
  }

  ngOnInit(): void {

  }


  async save() {
    const {name} = this.forms[0].value
    const {
      min_payment,
      min_fee,
      max_fee
    } = this.forms[1].value


    const delivery = {
      min_payment:  parseInt(min_payment),
      min_fee: parseInt(min_fee),
      max_fee: parseInt(max_fee)
    };
    this.loading = true;
    await this.warehouse.saveWarehouse(name, delivery);
    this.loading = false;
  }
}
