import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragableHorizontalListComponent } from './dragable-horizontal-list.component';

describe('DragableHorizontalListComponent', () => {
  let component: DragableHorizontalListComponent;
  let fixture: ComponentFixture<DragableHorizontalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragableHorizontalListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragableHorizontalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
