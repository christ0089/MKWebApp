import { Component, OnInit, ViewChild } from '@angular/core';
import { GeoPoint, query, Timestamp } from '@angular/fire/firestore';
import {
  Firestore,
  collectionData,
  collection,
  CollectionReference,
} from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';

import { MatTabChangeEvent } from '@angular/material/tabs';
import {
  FirestoreDataConverter,
  orderBy,
  Query,
  QueryDocumentSnapshot,
  where,
} from '@firebase/firestore';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { AuthService, UserData } from 'src/app/Services/Auth/auth.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter } from '../products/products.component';
import { IOrder, orderConverter, OrderStatus } from '../orders/orders.component';


@Component({
  selector: 'app-orders-tracking',
  templateUrl: './orders-tracking.component.html',
  styleUrls: ['./orders-tracking.component.sass'],
})
export class OrdersTrackingComponent implements OnInit {
  orders$: Observable<IOrder[]>;
  drivers$: Observable<any> = EMPTY;
  status = ['processing', 'in-transit'];
  campaignOne: FormGroup;
  currOrder!: IOrder;
  private selectedType = new BehaviorSubject<OrderStatus>(
    this.status[0] as OrderStatus
  );
  private selectedDriver$ = new BehaviorSubject<any>(null);  
  @ViewChild('edit_order_drawer') editDrawer!: MatDrawer;
  driver: any = null;


  constructor(
    private readonly afs: Firestore,
    private readonly auth: AuthService,
    private readonly warehouse: WarehouseService
  ) {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const day = today.getDate();

    this.campaignOne = new FormGroup({
      start: new FormControl(new Date(year, month, day - 7)),
      end: new FormControl(new Date(year, month, day + 1)),
    });

    const dateObserver = this.campaignOne.valueChanges;

    this.orders$ = combineLatest([
      this.selectedType.asObservable(),
      this.warehouse.selectedWarehouse$.asObservable(),
      dateObserver,
      this.selectedDriver$,
    ]).pipe(
      switchMap(([order_status, warehouse, dateObserver, driver]) => {
        const order_collection = collection(this.afs, 'orders').withConverter(
          orderConverter
        );
        const start = new Date(dateObserver.start);
        const end = new Date(dateObserver.end);

        let q: Query<IOrder> = query<IOrder>(
          order_collection,
          where('status', '==', order_status),
          where('payment_meta_data.warehouse_id', '==', warehouse?.id),
          where('createdAt', '>=', start),
          where('createdAt', '<=', end),
          orderBy('createdAt', 'desc')
        );

        if (driver !== null || driver?.id === null) {
          q = query<IOrder>(
            order_collection,
            where('status', '==', order_status),
            where('payment_meta_data.warehouse_id', '==', warehouse?.id),
            where('driver.id', '==', driver?.id),
            where('createdAt', '>=', start),
            where('createdAt', '<=', end),
            orderBy('createdAt', 'desc')
          );
        }

        if (auth.isServiceAdmin) {
          q = query<IOrder>(
            order_collection,
            where('status', '==', order_status),
            where('payment_meta_data.warehouse_id', '==', warehouse?.id),
            where('driver.id', '==', (this.auth.userData$.value as UserData).uid),
            where('createdAt', '>=', start),
            where('createdAt', '<=', end),
            orderBy('createdAt', 'desc')
          );
        }
        if (warehouse?.name === 'General') {
          if (auth.userData$.value.role === 'admin') {
            q = query<IOrder>(
              order_collection,
              where('status', '==', order_status),
              where('createdAt', '>=', start),
              where('createdAt', '<=', end),
              orderBy('createdAt', 'desc')
            );
          } else {
            return of([]);
          }
        }

        return collectionData<IOrder>(q, {
          idField: 'id',
        }).pipe(
          map((orders) => {

            const o = orders.filter(
              (or) => or.customer != '-hQUt1wUTc0httdD9p2V7oQB5m4v2' // TODO: Remove and filter based on demo order
            );

            const order_mapped = o.map((order) => {
              order.orderId = order.id.substring(0, 5).toUpperCase();
              return order;
            });
            return order_mapped;
          })
        );
      })
    );

    this.orders$.subscribe();

    this.drivers$ = combineLatest([
      this.warehouse.selectedWarehouse$,
    ]).pipe(
      switchMap(([warehouse]) => {
        if (this.auth.isServiceAdmin) {
          return ([])
        }
        const col = collection(this.afs, 'users').withConverter(
          genericConverter()
        );

        let q = query(col, where('warehouse_id', '==', warehouse?.id));

        return collectionData<any>(q, {
          idField: 'id',
        }).pipe(
          map((drivers: any) => {
            return drivers.map((driver: any) => {
              return {
                img: driver.img,
                name: driver?.name || '',
                id: driver.id,
              };
            });
          })
        );
      })
    );

    this.selectedDriver$.subscribe();
  }

  selectedDriver(driver: any) {
    this.selectedDriver$.next(driver);
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id === o2.id;
  }


  ngOnInit(): void { }

  changedTab(event: MatTabChangeEvent) {
    this.selectedType.next(this.status[event.index] as OrderStatus);
  }
  openOrder(order: IOrder) {
    this.currOrder = order;
    this.editDrawer.toggle();
  } 
}
