import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecomendationListsComponent } from './recomendation-lists.component';

describe('RecomendationListsComponent', () => {
  let component: RecomendationListsComponent;
  let fixture: ComponentFixture<RecomendationListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecomendationListsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecomendationListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
