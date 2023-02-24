import { Component, OnInit, ViewChild } from '@angular/core';
import { query } from '@angular/fire/firestore';
import {
  Firestore,
  collectionData,
  collection,
} from '@angular/fire/firestore';

import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';

import { MatTabChangeEvent } from '@angular/material/tabs';
import {
  orderBy,
  Query,
  where,
} from '@firebase/firestore';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  EMPTY,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { AuthService, UserData } from 'src/app/Services/Auth/auth.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter } from '../products/products.component';
import { IOrder, orderConverter, OrderStatus } from '../orders/orders.component';
import { MapService } from 'src/app/Services/MapService/map-service.service';
import { Database, ref, objectVal } from '@angular/fire/database';

export interface IDriver {
  img: string,
  name: string,
  id: string
}

@Component({
  selector: 'app-orders-tracking',
  templateUrl: './orders-tracking.component.html',
  styleUrls: ['./orders-tracking.component.sass'],
})
export class OrdersTrackingComponent implements OnInit {
  orders$: Observable<IOrder[]> = EMPTY;
  activeOrderTracking$: Observable<IOrder[]> = EMPTY;
  drivers$: Observable<IDriver[]> = EMPTY;
  status = ['processing', 'assigned', 'in-transit'];
  campaignOne: FormGroup;
  currOrder!: IOrder;
  private selectedType = new BehaviorSubject<OrderStatus>(
    this.status[0] as OrderStatus
  );
  private selectedDriver$ = new BehaviorSubject<any>(null);
  @ViewChild('edit_order_drawer') editDrawer!: MatDrawer;

  driver: any = null;
  markers = []


  constructor(
    private readonly afs: Firestore,
    private readonly db: Database,
    private readonly auth: AuthService,
    private readonly warehouse: WarehouseService,
    private readonly mapService: MapService
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
            const order_mapped = orders.map((order) => {
              order.orderId = order.id.substring(0, 5).toUpperCase();
              return order;
            });
            return order_mapped;
          })
        );
      })
    );

    this.orders$.pipe(
      tap((orders) => {
        const markerData = orders
          .filter(o => o.payment_meta_data.coords != null)
          .map(o => {
            const coords = [
              o.payment_meta_data.coords?.longitude,
              o.payment_meta_data.coords?.latitude,
            ];

            return {
              type: "order_start",
              id: o.id,
              coords
            }
          })

        this.mapService.markers.next(markerData)
      })
    ).subscribe();



    combineLatest([
      this.warehouse.selectedWarehouse$,
      this.campaignOne.valueChanges,
      this.selectedType
    ]).pipe(
      // takeWhile(([_, s]) => s == "in-transit"),
      shareReplay(1),
      switchMap(([_1, _2, s]) => {
        console.log(s)
        if (s !== "in-transit") {
          return of([])
        }
        const snapRef = ref(this.db, `orders`)

        return objectVal(snapRef)
      }
      )).subscribe((orderTracking: any) => {
        if (this.selectedType.value !== "in-transit") {
          return
        }
        const markerData = this.mapService.markers.value.map((marker) => {
          if (!orderTracking[marker.id]) { return marker }
          const coords = [
            orderTracking[marker.id].curr_coords.lon,
            orderTracking[marker.id].curr_coords.lat
          ];

          marker.curr_coords = coords
          marker.type = "in-transit"

          return marker
        })

        this.mapService.markers.next(markerData)
      })



    this.drivers$ = this.warehouse.selectedWarehouse$.pipe(
      shareReplay(1),
      switchMap((warehouse) => {
        if (this.auth.isServiceAdmin) {
          return ([])
        }
        const col = collection(this.afs, 'users').withConverter<IDriver>(
          genericConverter<IDriver>()
        );

        let q = query(col, where('warehouse_id', '==', warehouse?.id));

        return collectionData<IDriver>(q, {
          idField: 'id',
        })
      })
    );

    combineLatest([
      this.warehouse.selectedWarehouse$,
      this.campaignOne.valueChanges,
      this.selectedType
    ]).pipe(
      shareReplay(1),
      switchMap(() => {
        const snapRef = ref(this.db, `driver_location`)
        if (this.selectedType.value === "in-transit") {
          return of(null)
        }

        return objectVal<any>(snapRef)
      }),
      tap((markerData) => {
        if (!markerData) return
        const keys = Object.keys(markerData);
        const markers = keys.map(k => {
          const coords = [
            markerData[k].curr_coords.lon,
            markerData[k].curr_coords.lat
          ];
          return {
            coords,
            id: k,
            type: "driver_tracking"
          }
        })
        this.mapService.driver_markers.next(markers)
      })
    ).subscribe()

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
