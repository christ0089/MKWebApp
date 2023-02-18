import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { IQuestion } from 'src/app/Models/question';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';

export interface IHour {
  hours: number;
  mins: number;
}

export interface ISchedule {
  [day: string]: IHour[];
}

@Component({
  selector: 'app-time',
  templateUrl: './time.component.html',
  styleUrls: ['./time.component.sass'],
})
export class TimeComponent implements OnInit, OnChanges {
  days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sabado'
  ];
  @Input('schedule') schedule!: ISchedule;
  @Output('onFormSave') onFormSave = new EventEmitter();

  questions: IQuestion[][] = [];
  forms!: FormGroup[][];

  constructor(private qcs: QuestionControlService) { }

  ngOnInit(): void {
    this.questions = this.qcs.schedule_questionaire();

    this.forms = this.questions.map((q) =>
      q.map((_q) => this.qcs.toFormGroup(_q.questions))
    );

    console.log(this.questions);
  }

  ngOnChanges() {
    this.questions = this.qcs.schedule_questionaire();

    this.forms = this.questions.map((q) =>
      q.map((_q) => this.qcs.toFormGroup(_q.questions))
    );
    if (this.schedule) {
      Object.keys(this.schedule).forEach((k, i) => {
        this.questions[i].forEach((q, j) => {
          const question: QuestionBase<any>[] = this.qcs.mapToQuestion(
            q.questions,
            this.schedule[k][j]
          );
          console.log(this.schedule[k][j]);
          console.log(question);
          this.forms[i][j] = this.qcs.toFormGroup(question);
        })

      })
    }
  }

  save() {
    let schedule: any = this.days.reduce((a, _, i) => ({ ...a, [i]: "" }), {});
    this.forms.forEach((f, i) => {
      schedule[i] = f.map((_f, i) => _f.value)
    })
    this.onFormSave.emit(schedule);
  }
}
