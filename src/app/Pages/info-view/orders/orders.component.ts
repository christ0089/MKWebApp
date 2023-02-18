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
import { AuthService, UserData } from 'src/app/Services/Auth/auth.service';
import { ICoupon } from 'src/app/Services/QuestionsService/product_questionaire';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter, IProducts } from '../products/products.component';

import * as json2csv from 'json2csv';
import { DomSanitizer } from '@angular/platform-browser';
import { httpsCallable } from '@firebase/functions';

export interface IRatings {
  question: string;
  rating: number;
}

export interface Items {
  id: string;
  name: string;
  quantity: number;
  price: string;
}

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
  coupons?: ICoupon;
  ratings?: IRatings[];
  reinbured?: boolean
}

export interface FlattenedOrder {
  orderId: string;
  customer_name: string;
  payment_method: number;
  item_name: string;
  item_quantity: number;
  start_time: string;
  delivered_time: string;
  driver_name: string;
  coupons_name: string;
  coupon_discount: number;
  status: string;
  discount?: number;
  rating_avg?: number;
  price: number;
}

export type OrderStatus = 'processing' | 'in-transit' | 'completed' | 'canceled';

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
  status = ['completed', 'canceled'];
  campaignOne: FormGroup;
  currOrder!: IOrder;

  cash_total = 0;
  card_subtotal = 0;
  comissions = 0;
  payment_commisions = 0;
  card_total = 0;
  canceled_total = 0;
  quantity_total = 0;
  propina: number = 0;

  items_sold: Map<string, any> = new Map<string, any>();
  private selectedType = new BehaviorSubject<OrderStatus>(
    this.status[0] as OrderStatus
  );

  private selectedDriver$ = new BehaviorSubject<any>(null);
  driver: any = null;

  @ViewChild('edit_order_drawer') editDrawer!: MatDrawer;

  constructor(
    private readonly afs: Firestore,
    private readonly auth: AuthService,
    private readonly domSanitizer: DomSanitizer,
    private readonly functions: Functions,
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

        if (warehouse?.name === 'Torreón') { // TODO: Remove For Independen Operator
          if (auth.isZoneAdmin) {
            return of([]);
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
            console.log(orders);
            this.cash_total = 0;
            this.card_total = 0;
            this.card_subtotal = 0;
            this.propina = 0;
            this.payment_commisions = 0;

            const o = orders.filter(
              (or) => or.customer != 'hQUt1wUTc0httdD9p2V7oQB5m4v2' // TODO: Remove and filter based on demo order
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
                const rand: number = 1; // (Math.floor(Math.random() * 10) + 1 )* 3;
                if (
                  (order.payment.payment_method_types as string[]).indexOf(
                    'cash'
                  ) > -1 &&
                  order.status === 'completed'
                ) {
                  this.cash_total += (order.payment.amount / 100) * rand;

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
                  this.card_total +=
                    subtotal - comissions - 3 - (comissions + 3) * (16 / 100);
                }
                this.payment_commisions = this.payment_commisions + 15;
                this.propina = this.propina + (parseInt(order.payment.metadata.tip) || 0);
              }
              order.orderId = order.id.substring(0, 5).toUpperCase();
              return order;
            });
            return order_mapped;
          })
        );
      })
    );

    this.orders$.subscribe((orders) => {
      this.items_sold = new Map();
      this.quantity_total = 0;
      orders.forEach((o) => {
        const items: any[] = o.payment_meta_data.items;
        items.forEach((element: Items) => {
          this.quantity_total += element.quantity;
          if (this.items_sold.has(element.price)) {
            const curr_items = this.items_sold.get(element.price);
            curr_items.quantity += element.quantity;
            this.items_sold.set(element.price, curr_items);
          } else {
            const curr_items = element;
            this.items_sold.set(element.price, curr_items);
          }
        });
      });
    });

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

  ordersToCSV(orders: IOrder[]) {
    let flatOrder: FlattenedOrder[] = [];

    orders.forEach((order) => {
      order.payment_meta_data.items.forEach((element: any) => {
        try {
          flatOrder.push({
            price: order.payment.amount / 100,
            orderId: order.orderId,
            driver_name: order.driver !== undefined || order.driver !== null ? order.driver.name : '',
            customer_name: order.shipping.name !== undefined || order.shipping.name !== null ? order.shipping.name : '',
            coupons_name: order.coupons?.code || '',
            coupon_discount: order.coupons?.discount || 0,
            payment_method: order.payment.payment_method_types[0],
            rating_avg: 0,
            status: order.status,
            item_name: element.name !== undefined || element.name !== null ? element.name : '',
            item_quantity: element.quantity,
            start_time: order.createdAt?.toString() || '',
            delivered_time: order.delivered_time?.toString() || '',
          });
        }
        catch (e) {
          console.error(e)
        }
      });
    });

    if (flatOrder.length > 0) {
      const fields = [...Object.keys(flatOrder[0])];
      const ops = { fields, output: 'report_file.csv' };
      const csv = json2csv.parse(flatOrder, ops);
      return this.domSanitizer.bypassSecurityTrustUrl(
        'data:text/csv,' + encodeURIComponent(csv)
      );
    }
    return null;
  }

  ngOnInit(): void { }

  changedTab(event: MatTabChangeEvent) {
    this.selectedType.next(this.status[event.index] as OrderStatus);
  }

  reinburse(order: IOrder) {
    const prodFunction = httpsCallable(this.functions, 'stripeActionsFunc'); //Creates product in Strip
    const prod$ = prodFunction({
      event: 'product.update',
    });
  }

  openOrder(order: IOrder) {
    this.currOrder = order;
    this.editDrawer.toggle();
  }
}
