import { Component, OnInit } from '@angular/core';
import { query, serverTimestamp } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { collection, Firestore, orderBy, where } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  map,
  of,
  switchMap,
} from 'rxjs';
import { UserData } from 'src/app/Services/Auth/auth.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter } from '../info-view/products/products.component';
import { doc, setDoc } from '@firebase/firestore';
import { Functions } from '@angular/fire/functions';

export type Role = 'general' | 'driver' | 'zone_admin' | 'admin';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass'],
})
export class UsersComponent implements OnInit {
  status: Role[] = ['general', 'driver', 'zone_admin', 'admin'];
  private selectedType = new BehaviorSubject<Role>(this.status[0]);
  users$ = new BehaviorSubject<UserData[]>([]);
  searchForm = new FormControl();

  constructor(
    private readonly warehouse: WarehouseService,
    private readonly functions: Functions,
    private readonly afs: Firestore
  ) {
    this.loadUsers().subscribe((users) => {
      this.users$.next(users);
    });

    this.searchForm.valueChanges.subscribe((userInput) => {
      this.searchProd(userInput);
    });
  }

  ngOnInit(): void {
    
  }

  loadUsers() {
    return combineLatest([
      this.warehouse.selectedWarehouse$,
      this.selectedType,
    ]).pipe(
      switchMap(([warehouse, selectedType]) => {
        if (warehouse === null) {
          return of([]);
        }
        let user_collection = collection(
          this.afs,
          'users'
        ).withConverter<UserData>(genericConverter<UserData>());

        console.log(warehouse);
        let q = query<UserData>(
          user_collection,
          where('role', '==', selectedType),
          where('warehouse_id', '==', warehouse.id)
        );
        if (warehouse?.name === 'General') {
          q = query<UserData>(
            user_collection,
            where('role', '==', selectedType)
          );
        }

        if (selectedType === 'general') {
          q = query<UserData>(user_collection);
        }

        return collectionData<UserData>(q, {
          idField: 'id',
        }).pipe(
          map((user) => {
            return user;
          })
        );
      })
    );
  }

  changedTab(event: MatTabChangeEvent) {
    this.selectedType.next(this.status[event.index]);
  }

  async searchProd(search: string) {
    const prodName: string = search.toLowerCase();
    if (prodName == '' || this.users$.value == []) {
      const users = await firstValueFrom(this.loadUsers());
      console.log(users);
      this.users$.next(users);
    } else {
      const users = this.users$.value.filter((v) => {
        const hasEmail = v.email.toLowerCase().includes(prodName);
        const hasName = v.name.toLowerCase().includes(prodName);
        return v.phone.toLowerCase().includes(prodName) || hasEmail || hasName;
      });
      this.users$.next(users);
    }
  }

  createRepresentative(user: UserData) {
    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/representative/${user.id}`
    );

    setDoc(docRef, {
      email: user.email,
      name: user.name,
      role: "representative",
      active: true,
      coupon_id: (user.email as string).substr(0,5) + (user.id as string) .substr(0,2),
      createdAt: serverTimestamp()
    }, {
      merge : true
    })
  }
}
