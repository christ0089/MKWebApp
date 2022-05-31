import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  product_questionaire,
  brand_questionaire,
  ads_questionaire,
  coupon_questionaire,
  notification_question,
  IQuestions,
} from './product_questionaire';
import { warehouse_questionaire } from './warehouse_questionaire';
import { UserRoles } from '../Auth/auth.service';

@Injectable()
export class QuestionControlService {
  formData = new BehaviorSubject<any>({});

  constructor() {}

  currentPath = '';

  toFormGroup(questions: QuestionBase<any>[]) {
    let group: any = {};

    for (let question of questions) {
      if (question.type == 'calendar') {
        let _question = (group[question.key] = question.required
          ? new FormControl(
              question.value || new Date(),
              [Validators.required].concat(...question.validators)
            )
          : new FormControl({
              value: question.value || new Date(),
              disabled: question.disabled,
            }));
        console.log(_question);
        break;
      }

      group[question.key] = question.required
        ? new FormControl(
            question.value || '',
            [Validators.required].concat(...question.validators)
          )
        : new FormControl({
            value: question.value || '',
            disabled: question.disabled,
          });
    }
    return new FormGroup(group);
  }

  toEditFormGroup(questions: QuestionBase<string>[], data: any) {
    let group: any = {};

    questions.forEach((question) => {
      group[question.key] = question.required
        ? new FormControl(
            data[question.key] || '',
            [Validators.required].concat(question.validators)
          )
        : new FormControl(
            { value: data[question.key], disabled: question.disabled } || ''
          );
    });

    return new FormGroup(group);
  }

  mapToQuestion(
    questions: QuestionBase<string | number | boolean | Date>[],
    data: any
  ) {
    questions.forEach((question) => {
      question.value = data[question.key];
      question.options = data['options'] || question.options;
    });
    return questions;
  }

  changeState(state: boolean, questions = [], title = '', options = null) {
    this.formData.next({
      state: state,
      questions: questions,
      title: title,
      options: options,
    });
  }

  getState(): Observable<any> {
    return this.formData.asObservable();
  }

  product_questionaire() {
    const question = product_questionaire();
    return question;
  }

  ad_questionaire() {
    const question = ads_questionaire();
    return question;
  }

  brand_questionaire(user_role: UserRoles) {
    const question = brand_questionaire(user_role);
    return question;
  }

  coupon_questionaire() {
    const question = coupon_questionaire();
    return question;
  }

  warehouse_questionaire() {
    const question = warehouse_questionaire();
    return question;
  }

  notification_questionaire(): IQuestions {
    return notification_question();
  }
}
