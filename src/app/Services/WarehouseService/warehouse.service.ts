import { Injectable } from '@angular/core';
import { collection, Firestore } from '@angular/fire/firestore';
import { doc, query, setDoc, where } from '@firebase/firestore';
import { collectionData, docData } from 'rxfire/firestore';
import { BehaviorSubject, EMPTY, map, Observable, switchMap } from 'rxjs';
import {
  genericConverter,
  IWarehouse,
  warehouseConverter,
} from 'src/app/Pages/info-view/products/products.component';
import { AuthService, UserData } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  warehouses$: Observable<IWarehouse[]> = EMPTY;
  selectedWarehouse$ = new BehaviorSubject<IWarehouse | null>(null);
  constructor(
    private readonly afs: Firestore,
    private readonly auth: AuthService
  ) {
    // TODO: Warehouse by ownership

    if (this.auth.isAdmin) {
      const warehouse_collection = collection(
        this.afs,
        'warehouse'
      ).withConverter<IWarehouse>(genericConverter<IWarehouse>());

      this.warehouses$ = this.auth.userData$.pipe(
        switchMap((user: UserData) => {
          let q = query(warehouse_collection);

          if (user.role === 'zone_admin') {
            q = query(
              warehouse_collection,
              where('owner', 'array-contains', user.uid)
            );
          }

          return collectionData<IWarehouse>(q, {
            idField: 'id',
          }).pipe(
            map((warehouse) => {
              this.selectedWarehouse$.next(warehouse[0]);
              return warehouse;
            })
          );
        })
      );
    }
    if (this.auth.isServiceAdmin) {
      this.warehouses$ = this.auth.userData$.pipe(
        switchMap((user: UserData) => {
          let docRef = doc(
            this.afs,
            `warehouse/${user.warehouse_id}`
          ).withConverter<IWarehouse>(genericConverter<IWarehouse>());

          return docData<IWarehouse>(docRef).pipe(
            map((warehouse) => {
              console.log(warehouse);
              warehouse.id = user.warehouse_id as string;
              this.selectedWarehouse$.next(warehouse);
              return [warehouse];
            })
          );
        })
      );
    }

    this.warehouses$.subscribe();
  }

  async saveWarehouse(
    name: string,
    alchohol_time: number[],
    close_time: number[],
    start_time: number[],
    delivery: any
  ) {
    const warehouse_ref = doc(
      this.afs,
      `warehouse/${this.selectedWarehouse$.value?.id}`
    );
    await setDoc(
      warehouse_ref,
      {
        name,
        alchohol_time,
        close_time,
        start_time,
        delivery,
      },
      { merge: true }
    );
  }
}
