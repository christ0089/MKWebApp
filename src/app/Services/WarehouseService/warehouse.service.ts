import { Injectable } from '@angular/core';
import { collection, Firestore } from '@angular/fire/firestore';
import { doc, query, setDoc, where } from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, EMPTY, map, Observable, switchMap } from 'rxjs';
import {
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

    const warehouse_collection = collection(
      this.afs,
      'warehouse'
    ).withConverter(warehouseConverter);
    this.warehouses$ = this.auth.userData$.pipe(
      switchMap((user: UserData) => {
        let q = query(warehouse_collection)

        if (user.role === 'zone_admin') {
          q = query(warehouse_collection, where("owner","array-contains", user.uid))
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

    this.warehouses$.subscribe();
  }

  async saveWarehouse(name: string, delivery: any) {
    const warehouse_ref = doc(this.afs,`warehouse/${this.selectedWarehouse$.value?.id}`)
    await setDoc(warehouse_ref, {
      name,
      delivery
    }, {merge: true})
  }
}
