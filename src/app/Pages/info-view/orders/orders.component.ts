import { Component, OnInit, ViewChild } from '@angular/core';
import { GeoPoint, query, Timestamp } from '@angular/fire/firestore';
import {
  Firestore,
  collectionData,
  collection,
  CollectionReference,
} from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';

import { MatTabChangeEvent } from '@angular/material/tabs';
import {
  FirestoreDataConverter,
  limit,
  orderBy,
  QueryDocumentSnapshot,
  where,
} from '@firebase/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter } from '../products/products.component';

export interface IOrder {
  id: string;
  orderId: string;
  customer: string;
  curr_coords?: GeoPoint;
  start_coords?: GeoPoint;
  delivery_time: number;
  start_time: Timestamp;
  delivered_time: Timestamp;
  driver: any;
  shipping: any;
  payment_meta_data: any;
  payment: any;
  createdAt: Timestamp;
  status: OrderStatus;
}

type OrderStatus = 'processing' | 'in-transit' | 'completed' | 'canceled';

export const orderConverter: FirestoreDataConverter<IOrder> = {
  toFirestore(order: IOrder): DocumentData {
    return order;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): IOrder {
    const data = snapshot.data()!;
    return data as IOrder;
  },
};

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.sass'],
})
export class OrdersComponent implements OnInit {
  orders$: Observable<IOrder[]>;
  drivers$: Observable<any> = EMPTY;
  status = ['processing', 'in-transit', 'completed', 'canceled'];
  campaignOne: FormGroup;
  currOrder!: IOrder;

  cash_total = 0;
  card_subtotal = 0;
  comissions = 0;
  card_total = 0;
  canceled_total = 0;
  quantity_total = 0;

  items_sold: Map<string, any> = new Map<string, any>();
  private selectedType = new BehaviorSubject<OrderStatus>(
    this.status[0] as OrderStatus
  );

  private selectedDriver$ = new BehaviorSubject<any>(null);
  driver: any = null;

  @ViewChild('edit_prod_drawer') editDrawer!: MatDrawer;

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
      this.selectedDriver$
    ]).pipe(
      switchMap(([order_status, warehouse, dateObserver, driver]) => {
        const order_collection = collection(this.afs, 'orders').withConverter(
          orderConverter
        );
        const start = new Date(dateObserver.start);
        const end = new Date(dateObserver.end);
        let q = query<IOrder>(
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

        if (warehouse?.name === 'Torreón') {
          if (auth.userData$.value.role !== 'admin') {
            return of([]);
          } 
        }

        return collectionData<IOrder>(q, {
          idField: 'id',
        }).pipe(
          map((orders) => {
            this.cash_total = 0;
            this.card_total = 0;
            this.card_subtotal = 0;
            this.quantity_total = 0;
            this.items_sold = new Map();

            const o = orders.filter(
              (or) => or.customer != 'hQUt1wUTc0httdD9p2V7oQB5m4v2'
            );

            const order_mapped = o.map((order) => {
              if (order_status === 'canceled') {
                if (
                  (order.payment.payment_method_types as string[]).indexOf(
                    'cash'
                  ) > -1 &&
                  order.status === order_status
                ) {
                  this.cash_total += order.payment.amount / 100;
                }
                if (
                  (order.payment.payment_method_types as string[]).indexOf(
                    'card'
                  ) > -1 &&
                  order.status === order_status
                ) {
                  this.card_total += order.payment.amount / 100;
                }
              }
              if (order_status == 'completed') {
                const rand: number = 1; //(Math.floor(Math.random() * 10) + 1 )* 3;
                if (
                  (order.payment.payment_method_types as string[]).indexOf(
                    'cash'
                  ) > -1 &&
                  order.status === 'completed'
                ) {
                  this.cash_total += (order.payment.amount / 100) * rand;
                  order.payment_meta_data.items.forEach((element: any) => {
                    this.orders(element, rand);
                  });
                }
                if (
                  (order.payment.payment_method_types as string[]).indexOf(
                    'card'
                  ) > -1 &&
                  order.status === 'completed'
                ) {
                  const comissions =
                    (((order.payment.amount as number) * 36) / 100000) * rand;
                  const subtotal = (order.payment.amount / 100) * rand;
                  this.card_subtotal += subtotal;
                  this.card_total += subtotal - comissions - 3.5;
                  order.payment_meta_data.items.forEach((element: any) => {
                    this.orders(element, rand);
                  });
                }
              }
              order.orderId = order.id.substring(0, 5).toUpperCase();
              return order;
            });
            return order_mapped
          })
        );
      })
    );

    this.drivers$ = combineLatest([
      this.auth.userData$,
      this.warehouse.selectedWarehouse$,
    ]).pipe(
      switchMap(([user, warehouse]) => {
        if (!user) {
          return [];
        }
        if (user.role != 'driver' && !warehouse) {
          return [];
        }
        const col = collection(this.afs, 'users').withConverter(
          genericConverter()
        );

        let q = query(
          col,
          where('warehouse_id', '==', warehouse?.id)
        );

        return collectionData<any>(q, {
          idField: 'id',
        }).pipe(
          map((drivers: any) => {
            return drivers.map((driver: any) => {
              return {
                img: driver.img,
                name: driver.name,
                id: driver.id,
              };
            });
          })
        );
      })
    );

    this.selectedDriver$.subscribe()
 
  }

  selectedDriver(driver : any) {
    this.selectedDriver$.next(driver);
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 && o1.id === o2.id;
  }

  orders(items: any, multiplier = 1) {
    if (this.items_sold.has(items.price)) {
      const curr_items = this.items_sold.get(items.price);
      curr_items.quantity += items.quantity * multiplier;
      this.quantity_total += items.quantity * multiplier;
      this.items_sold.set(items.price, curr_items);
    } else {
      this.quantity_total += items.quantity * multiplier;
      const curr_items = items;
      curr_items.quantity = items.quantity * multiplier;
      this.items_sold.set(items.price, curr_items);
    }
  }

  ngOnInit(): void {}

  changedTab(event: MatTabChangeEvent) {
    this.selectedType.next(this.status[event.index] as OrderStatus);
  }


  openOrder(order: IOrder) {
    this.currOrder = order;
    this.editDrawer.toggle();
  }
}
