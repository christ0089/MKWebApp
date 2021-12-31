import { QuestionBase } from './question-base';

export class RadioQuestion extends QuestionBase<string> {
  override controlType = 'radio_options';
  override options: {key: string | number, value: string| number}[] = [];

  constructor(options: any = null) {
    super(options);
    this.options = options['options'] || [];
  }
}