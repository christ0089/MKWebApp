import { Injectable } from '@angular/core';
import { QueryConstraint } from '@firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { IBrands } from '../Models/DataModels';
import { IProducts } from '../Pages/info-view/products/products.component';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  brand$: BehaviorSubject<IBrands | null> = new BehaviorSubject<IBrands | null>(null);
  brand_filters$: BehaviorSubject<QueryConstraint[][]> = new BehaviorSubject<QueryConstraint[][]>([]);
  prod$: BehaviorSubject<IProducts | null> = new BehaviorSubject<IProducts | null>(null)
  constructor() { 

  }

  
}
