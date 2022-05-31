import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import {
  collection,
  doc,
  query,
  QueryConstraint,
  setDoc,
} from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  firstValueFrom,
  of,
  switchMap,
} from 'rxjs';
import { IBrands } from 'src/app/Models/DataModels';
import {
  genericConverter,
  IProducts,
  IWarehouse,
} from 'src/app/Pages/info-view/products/products.component';
import { BrandService } from 'src/app/Services/brand.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

@Component({
  selector: 'app-dragrable-product-list',
  templateUrl: './dragrable-product-list.component.html',
  styleUrls: ['./dragrable-product-list.component.sass'],
})
export class DragrableProductListComponent implements OnInit {

  @Input() gen_path: string = "stripe_products";
  all_products$ = new BehaviorSubject<IProducts[]>([]);
  gen_products$ = new BehaviorSubject<IProducts[]>([]);
  del_prods = [];
  @Output() editProdEvent = new EventEmitter<boolean>();
  @Output() saveProdEvent = new EventEmitter<IProducts[]>();
  @Output() deleteProdEvent = new EventEmitter<IProducts[]>();

  searchForm = new FormControl();
  selectedWarehouse!: IWarehouse | null;
  userRole: boolean = false;

  constructor(
    private readonly afs: Firestore,
    private readonly brand: BrandService,
    private readonly warehouse: WarehouseService
  ) {
    this.warehouse.selectedWarehouse$.subscribe((warehouse) => {
      if (!warehouse) {
        this.selectedWarehouse = null;
      }
      this.selectedWarehouse = warehouse;
    });

    combineLatest([this.brand.brand$, this.brand.brand_filters$])
      .pipe(
        switchMap(([_,filters]) => {
          return this.loadProducts(
            `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products`,
            filters[0]
          );
        })
      )
      .subscribe((prods) => {
        this.all_products$.next(prods);
      });

    combineLatest([this.brand.brand$, this.brand.brand_filters$])
      .pipe(
        switchMap(([_, filters]) => {
          console.log(filters)
          return this.loadProducts(`${this.gen_path}`, filters[1]);
        })
      )
      .subscribe((prods) => {
        this.gen_products$.next(prods);
      });

    this.searchForm.valueChanges.subscribe((userInput) => {
      this.searchProd(userInput);
    });
  }

  ngOnInit(): void {}

  loadProducts(
    path: string,
    filters: QueryConstraint[] = []
  ) {
    let docRef = collection(this.afs, path).withConverter<IProducts>(
      genericConverter<IProducts>()
    );
    const q = query(docRef, ...filters);

    return collectionData<IProducts>(q, {
      idField: 'id',
    });
  }

  save() {
    this.saveProdEvent.emit(this.all_products$.value)
  }

  addProduct(product: IProducts) {
    const exists = this.all_products$.value.findIndex(
      (v) => v.id === product.id
    );
    if (exists < 0) {
      let prods = this.all_products$.value;
      prods.push(product);
      this.all_products$.next(prods);
    }
  }

  editProduct(prod: IProducts) {
    this.brand.prod$.next(prod);
    this.editProdEvent.emit(true);
  }

  removeProduct(product: IProducts) {
    const exists = this.all_products$.value.findIndex(
      (v) => v.id === product.id
    );
    if (exists >= 0) {
      let prods = this.all_products$.value;
      prods.splice(exists, 1);
      this.all_products$.next(prods);
    }

    this.deleteProdEvent.emit([product]);
  }


  addAllProduct() {
    this.all_products$.next(this.gen_products$.value)
  }

  removeAllProduct() {
    this.deleteProdEvent.emit(this.all_products$.value);
  }

  

  async searchProd(search: string) {
    const prodName: string = search.toLowerCase();
    if (prodName == '' || this.gen_products$.value == []) {
      const prods = await firstValueFrom(
        this.loadProducts(`${this.gen_path}`, this.brand.brand_filters$.value[0])
      );
      this.gen_products$.next(prods);
    } else {
      const prods = this.gen_products$.value.filter((v) => {
        const hasBrand = v.stripe_metadata_brand
          .toLowerCase()
          .includes(prodName);
        const hasType = v.stripe_metadata_type.toLowerCase().includes(prodName);
        return v.name.toLowerCase().includes(prodName) || hasBrand || hasType;
      });
      this.gen_products$.next(prods);
    }
  }

  drop(event: CdkDragDrop<IProducts[]>) {
    moveItemInArray(
      this.all_products$.value,
      event.previousIndex,
      event.currentIndex
    );
  }
}
