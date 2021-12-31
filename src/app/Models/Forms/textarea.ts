import { QuestionBase } from "./question-base";

export class TextArea extends QuestionBase<string> {
  override controlType = "textarea";
  override type: string;

  constructor(options: any = null) {
    super(options);
    this.type = options["type"] || "";
  }
}
