import { QuestionBase } from "./question-base";

export class VerfifyFileQuestion extends QuestionBase<string> {
  override controlType = "verify_file";
  override type: string;

  constructor(options: any) {
    super(options);
    this.type = options["type"] || "";
    this.options = options['options'] || [];
  }
}
