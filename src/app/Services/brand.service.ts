import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IBrands } from '../Models/DataModels';
import { IProducts } from '../Pages/info-view/products/products.component';

@Injectable({
  providedIn: 'root'
})
export class BrandService {


  brand$: BehaviorSubject<IBrands | null> = new BehaviorSubject<IBrands | null>(null);
  prod$: BehaviorSubject<IProducts | null> = new BehaviorSubject<IProducts | null>(null)
  constructor() { 

  }

  
}
