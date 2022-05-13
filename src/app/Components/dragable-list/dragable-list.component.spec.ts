import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragableListComponent } from './dragable-list.component';

describe('DragableListComponent', () => {
  let component: DragableListComponent;
  let fixture: ComponentFixture<DragableListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragableListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
