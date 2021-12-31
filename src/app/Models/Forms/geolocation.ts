import { QuestionBase } from "./question-base";

export class GeolocationQuestion extends QuestionBase<string> {
  override controlType = "geolocation";
  override type: string;

  constructor(options: any = null) {
    super(options);
    this.type = options["type"] || "";
  }
}
