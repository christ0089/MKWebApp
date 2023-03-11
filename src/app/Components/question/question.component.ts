import { Component, Input, Output } from "@angular/core";
import { FormControl, UntypedFormGroup } from "@angular/forms";
import { QuestionBase } from "src/app/Models/Forms/question-base";
import { EventEmitter } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

import { DatePipe } from '@angular/common';

@Component({
  selector: "app-question",
  styleUrls: ["question.component.scss"],
  templateUrl: "./question.component.html",
})
export class DynamicFormQuestionComponent {
  @Input() question!: QuestionBase<string | number | boolean | Date>;
  @Input() form!: UntypedFormGroup;
  @Input() idx: number = 0;

  @Output() fileUpload = new EventEmitter<File>();
  @Output() document_state = new EventEmitter<any>();

  get isValid() {
    return (this.form as UntypedFormGroup).controls[this.question.key].valid;
  }

  fileChange(event: any) {
    const file: File = event.target.files[0];

    var mimeType = event.target.files[0].type;

    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);

    reader.onload = (_event) => {
      const png =  (reader.result as string)
      this.question.value = png;
      this.form.controls[this.question.key].setValue(png);
      
    }
    this.fileUpload.emit(file);
  }


  compareObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }



  download() {
    window.open(this.question.value as string);
  }


}
