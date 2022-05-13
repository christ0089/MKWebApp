import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragrableProductListComponent } from './dragrable-product-list.component';

describe('DragrableProductListComponent', () => {
  let component: DragrableProductListComponent;
  let fixture: ComponentFixture<DragrableProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DragrableProductListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DragrableProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
