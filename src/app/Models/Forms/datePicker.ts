import { QuestionBase } from "./question-base";

export class DatePickerQuestion extends QuestionBase<Date> {
  override controlType = "calendar";
  override type: string;

  constructor(options: any) {
    super(options);
    this.type = options["type"] || "";
    this.options = options['options'] || [{key: "", value: null},{key: "", value: null}];
  }
}
