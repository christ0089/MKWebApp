import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Firestore, where } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import {
  collection,
  doc,
  query,
  setDoc,
} from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, filter, firstValueFrom, of, switchMap } from 'rxjs';
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
  all_products$ = new BehaviorSubject<IProducts[]>([]);
  gen_products$ = new BehaviorSubject<IProducts[]>([]);
  @Output() editProdEvent = new EventEmitter<boolean>();

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



    this.brand.brand$
      .pipe(
        switchMap((brand) => {
          console.log(brand);
          if (!brand) {
            return of([]);
          }
          let docRef = collection(
            this.afs,
            `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products`
          ).withConverter<IProducts>(genericConverter<IProducts>());

          console.log(
            `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products`
          );

          const q = query(
            docRef,
            where('stripe_metadata_brand', '==', brand.brand),
            where('stripe_metadata_type', '==', brand.type)
          );

          return collectionData<IProducts>(q, {
            idField: 'id',
          });
        })
      )
      .subscribe((prods) => {
        prods = prods
          .map((p) => {
            p.ranking = p.ranking || 0;
            return p;
          })
          .sort((a, b) => a.ranking - b.ranking);
        this.all_products$.next(prods);
      });

    this.brand.brand$
      .pipe(
        switchMap((brand: IBrands | null) => {
          return this.loadProducts(brand);
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

  loadProducts(brand: IBrands | null) {
    if (!brand) {
      return of([]);
    }
    let docRef = collection(
      this.afs,
      `stripe_products`
    ).withConverter<IProducts>(genericConverter<IProducts>());

    const q = query(
      docRef,
      where('stripe_metadata_brand', '==', brand.brand),
      where('stripe_metadata_type', '==', brand.type)
    );

    return collectionData<IProducts>(q, {
      idField: 'id',
    });
  }

  save() {
    this.all_products$.value.forEach((product, i) => {
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${product.id}`
      );
      setDoc(docRef, { ranking: i }, { merge: true });
    });
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
  }

  async searchProd(search: string) {
    const prodName: string = search.toLowerCase();
    if (prodName == '' || this.gen_products$.value == []) {
      const prods = await firstValueFrom(
        this.loadProducts(this.brand.brand$.value)
      );
      console.log(prods);
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

  drop(event: CdkDragDrop<IBrands[]>) {
    moveItemInArray(
      this.all_products$.value,
      event.previousIndex,
      event.currentIndex
    );
  }
}
