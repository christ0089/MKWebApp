import { Component, OnInit } from '@angular/core';
import { Firestore, setDoc } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { User } from '@firebase/auth';
import { collection, doc, query } from '@firebase/firestore';
import { map } from '@firebase/util';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { IRepresentative } from 'src/app/Models/DataModels';
import { UserData } from 'src/app/Services/Auth/auth.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

@Component({
  selector: 'app-representatives',
  templateUrl: './representatives.component.html',
  styleUrls: ['./representatives.component.sass'],
})
export class RepresentativesComponent implements OnInit {
  searchForm = new FormControl();
  users$ = new BehaviorSubject<IRepresentative[]>([]);

  constructor(
    private readonly warehouse: WarehouseService,
    private readonly afs: Firestore,
  ) {}

  ngOnInit(): void {}


  loadData() {
    return this.warehouse.selectedWarehouse$.pipe(
      // switchMap((warehouse) => {
      //   if (warehouse === null) {
      //     return of([]);
      //   }
      //   let product_collection = collection(
      //     this.afs,
      //     'representatives'
      //   ).withConverter(Converter);

      //   if (warehouse?.name !== 'General') {
      //     product_collection = collection(
      //       this.afs,
      //       `warehouse/${warehouse.id}/stripe_products`
      //     ).withConverter(prodConverter);
      //   }
      //   const q = query<IProducts>(
      //     product_collection,
      //     orderBy('stripe_metadata_brand', 'desc')
      //   );
      //   return collectionData<IProducts>(q, {
      //     idField: 'id',
      //   }).pipe(
      //     map((prod) => {
      //       return prod;
      //     })
      //   );
      // })
    );
  }


  deactivateRep(user: IRepresentative) {
    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/representative/${user.id}`
    );

    setDoc(docRef, {
      active: false,
    }, {
      merge : true
    })
  }
  
  viewStats() {
    
  }

}
