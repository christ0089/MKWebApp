import { animate, style, transition, trigger } from "@angular/animations";
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { EventEmitter } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { BehaviorSubject, Subject } from "rxjs";
import {
  debounce,
  debounceTime,
  distinctUntilChanged,
  map,
} from "rxjs/operators";
import { QuestionBase } from "src/app/Models/Forms/question-base";
import { Feature, MapboxService } from "src/app/Services/Mapbox/mapbox.service";

@Component({
  selector: "geo-question",
  templateUrl: "./geo-question.component.html",
  styleUrls: ["./geo-question.component.scss"],
  animations: [
    trigger("fadeIn", [
      transition(":enter", [
        style({
          opacity: "0",
        }),
        animate(".3s ease-in"),
      ]),
    ]),
  ],
})
export class GeoQuestionComponent implements OnInit {
  @Input() question: QuestionBase<string>;
  @Input() idx: number;
  @Input() form: UntypedFormGroup;
  @Output() geoLocation = new EventEmitter();
  modelChanged: Subject<string> = new Subject<string>();

  @ViewChild("input", { read: true, static: true }) inputElRef: ElementRef;

  autocompleteItems: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);

  constructor(private mapbox: MapboxService) {
    this.modelChanged
      .pipe(
        debounceTime(300), // wait 300ms after the last event before emitting last event
        distinctUntilChanged() // only emit if value is different from previous value
      )
      .subscribe((model) => {
        this.mapbox
          .search_word(model, (address) => {
            console.log(address);
            this.autocompleteItems.next(address);
          });
      });
  }

  chooseItem(item: any) {
    this.question.value = item.description;
    console.log(item);
    this.mapbox.geoCode(item.description, (res) => {
      console.log(res)
      this.geoLocation.emit(res);
      this.autocompleteItems.next([])
    });

  }



  ngOnInit() {}

  updateSearch($event) {
    const val = $event.target.value.toLowerCase();
    if (val === "") {
      this.autocompleteItems.next([]);
      return;
    }else {
      this.modelChanged.next(val);
    }
  }
}
