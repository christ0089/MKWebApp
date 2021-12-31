import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoQuestionComponent } from './geo-question.component';

describe('GeoQuestionComponent', () => {
  let component: GeoQuestionComponent;
  let fixture: ComponentFixture<GeoQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeoQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
