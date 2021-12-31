import { QuestionBase } from "./question-base";

export class UploadFileQuestion extends QuestionBase<string> {
  override controlType = "upload_file";
  override type: string;

  constructor(options: any) {
    super(options);
    this.type = options["type"] || "";
    this.options = options['options'] || [];
  }
}