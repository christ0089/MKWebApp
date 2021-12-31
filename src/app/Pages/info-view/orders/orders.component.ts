import { Component, OnInit } from '@angular/core';
import { GeoPoint, query, Timestamp } from '@angular/fire/firestore';
import { Firestore, collectionData, collection, CollectionReference } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';

import { MatTabChangeEvent } from '@angular/material/tabs';
import { FirestoreDataConverter, limit, orderBy, QueryDocumentSnapshot, where } from '@firebase/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { BehaviorSubject, combineLatest, combineLatestAll, forkJoin, map, Observable, switchMap, tap } from 'rxjs';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';


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

type OrderStatus = 'processing' | 'in-transit' | 'completed' | "canceled";

export const orderConverter: FirestoreDataConverter<IOrder> = {
  toFirestore(order: IOrder): DocumentData {
    return order
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): IOrder {
    const data = snapshot.data()!;
    return data as IOrder
  },
};

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.sass']
})
export class OrdersComponent implements OnInit {


  orders$: Observable<IOrder[]>;
  status = ['processing', 'in-transit', 'completed', "canceled"];
  campaignOne: FormGroup;
  cash_total = 0;
  card_total = 0;
  canceled_total = 0;

  items_sold: Map<string, any> = new Map<string, any>();
  private selectedType = new BehaviorSubject<OrderStatus>(this.status[0] as OrderStatus)

  constructor(
    private readonly afs: Firestore,
    private readonly warehouse: WarehouseService
  ) {

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const day = today.getDate()

    this.campaignOne = new FormGroup({
      start: new FormControl(new Date(year, month, day - 7)),
      end: new FormControl(new Date(year, month, day)),
    });

    const dateObserver = this.campaignOne.valueChanges

    this.orders$ = 
    combineLatest([this.selectedType.asObservable(),this.warehouse.selectedWarehouse$.asObservable(), dateObserver]).
    pipe(switchMap(([order_status, warehouse, dateObserver]) => {
      const  order_collection = collection(this.afs, 'orders').withConverter(orderConverter)
      const start = new Date(dateObserver.start);
      const end = new Date(dateObserver.end);
      let q = query<IOrder>(
        order_collection,
        where("status", "==", order_status),
        where("createdAt", ">=", start),
        where("createdAt","<=",end ),
        orderBy('createdAt', 'desc'))
     
      if (warehouse != null && warehouse?.name !== "General") {
        q = query<IOrder>(
          order_collection,
          where("status", "==", order_status),
          where("warehouse_id", "==", warehouse?.id),
          where("createdAt", ">=", start),
          orderBy('createdAt', 'desc'),)
      }
    
      return collectionData<IOrder>(q, {
        idField: "id"
      }).pipe(
        map((orders) => {
          this.cash_total = 0;
          this.card_total = 0;
          this.items_sold = new Map();

          const o = orders.filter((or) => or.customer != "hQUt1wUTc0httdD9p2V7oQB5m4v2")

          const order_mapped = o.map((order) => {
            if (order_status === "canceled") {
              if ((order.payment.payment_method_types as string[]).indexOf("cash") > -1 && order.status === order_status) {
                this.cash_total += (order.payment.amount / 100)
              }
              if ((order.payment.payment_method_types as string[]).indexOf("card") > -1 && order.status === order_status) {
                this.card_total += (order.payment.amount / 100)
              }
            }
            if (order_status == "completed") {
             
              if ((order.payment.payment_method_types as string[]).indexOf("cash") > -1 && order.status === "completed") {
                this.cash_total += (order.payment.amount / 100) * 7
                order.payment_meta_data.items.forEach((element:any) => {
                  this.orders(element);
                });
              }
              if ((order.payment.payment_method_types as string[]).indexOf("card") > -1 && order.status === "completed") {
                this.card_total += (order.payment.amount / 100) * 7
                order.payment_meta_data.items.forEach((element:any) => {
                  this.orders(element);
                });
              }
            }
            order.orderId = order.id.substring(0, 5).toUpperCase();
            return order
          })
        return order_mapped
        }))
    }))
  }


  orders(items: any) {
    if (this.items_sold.has(items.price)) {
      const curr_items = this.items_sold.get(items.price) 
      curr_items.quantity += items.quantity
      this.items_sold.set(items.price, curr_items)
    } else {
      this.items_sold.set(items.price, items)
    }
  }

  ngOnInit(): void {
  }

  changedTab(event: MatTabChangeEvent) {
    this.selectedType.next(this.status[event.index] as OrderStatus)
  }

}
