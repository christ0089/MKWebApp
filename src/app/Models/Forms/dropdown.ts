import { QuestionBase } from './question-base';

export class DropdownQuestion extends QuestionBase<string> {
  override controlType = 'dropdown';
  override options: {key: string | number, value: string| number}[] = [];

  constructor(options: any = null) {
    super(options);
    this.options = options['options'] || [];
  }
}