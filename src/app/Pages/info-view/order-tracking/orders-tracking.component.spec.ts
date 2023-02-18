import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersTrackingComponent } from './orders-tracking.component';

describe('OrdersComponent', () => {
  let component: OrdersTrackingComponent;
  let fixture: ComponentFixture<OrdersTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrdersTrackingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
