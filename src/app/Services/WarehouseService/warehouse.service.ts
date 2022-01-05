import { Injectable } from '@angular/core';
import { collection, Firestore } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, EMPTY, map, Observable } from 'rxjs';
import { IWarehouse, warehouseConverter } from 'src/app/Pages/info-view/products/products.component';
import { AuthService } from '../Auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  warehouses$: Observable<IWarehouse[]> = EMPTY;
  selectedWarehouse$ = new BehaviorSubject<IWarehouse | null>(null);
  constructor(
    private readonly afs: Firestore,
  ) {

    // TODO: Warehouse by ownership  
    const warehouse_collection = collection(this.afs, 'warehouse').withConverter(warehouseConverter)
    this.warehouses$ = collectionData<IWarehouse>(warehouse_collection, { idField: "id" }).pipe(map((warehouse) => {
      this.selectedWarehouse$.next(warehouse[0])
      return warehouse;
    }))

    this.warehouses$.subscribe()
  }
}
