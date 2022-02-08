import { QuestionBase } from "./Forms/question-base";
import { QUESTIONAIRE_TYPE } from "./Enums/questionaire";
export interface IQuestion {
  title: string;
  subtitle?: string | null;
  key? : string | null,
  questions: QuestionBase<string | number | Date | boolean>[];
  comments?: string;
  type?: QUESTIONAIRE_TYPE;
}
