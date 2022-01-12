import { Component, OnInit } from '@angular/core';
import { query } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { collection, Firestore, orderBy, where } from '@angular/fire/firestore';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs';
import { UserData } from 'src/app/Services/Auth/auth.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter } from '../info-view/products/products.component';

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
    private readonly afs: Firestore
  ) {
    this.loadUsers().subscribe((users) => {
      this.users$.next(users);
    })
  }

  ngOnInit(): void {}

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

        console.log(warehouse)
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
        
        if (selectedType === "general") {
          q = query<UserData>(
            user_collection,
          );
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
}
