import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragableCircleComponent } from './dragable-circle.component';

describe('DragableCircleComponent', () => {
  let component: DragableCircleComponent;
  let fixture: ComponentFixture<DragableCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragableCircleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragableCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
