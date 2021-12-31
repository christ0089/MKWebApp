import { QuestionBase } from './question-base';

export class CheckboxQuestion extends QuestionBase<boolean> {
  override controlType = 'checkbox_options';

  constructor(options: any) {
    super(options);
    this.type = options["type"] || "";
  }
}