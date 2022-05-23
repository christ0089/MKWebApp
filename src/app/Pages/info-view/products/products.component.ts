import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { collection, Firestore, query } from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';

import {
  addDoc,
  deleteDoc,
  doc,
  FirestoreDataConverter,
  orderBy,
  QueryDocumentSnapshot,
  setDoc,
} from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { httpsCallable } from 'rxfire/functions';
import {
  BehaviorSubject,
  firstValueFrom,
  lastValueFrom,
  map,
  of,
  switchMap,
} from 'rxjs';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { StorageService } from 'src/app/Services/storage.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

export interface IProducts {
  id: number;
  active: boolean;
  images: string[] | string;
  name: string;
  ranking: number;
  description: string;
  availability: number;
  metadata?: Map<string, string>[];
  stripe_metadata_color: string;
  stripe_metadata_type: string;
  stripe_metadata_brand: string;
  stripe_metadata_discount?: number | string | null;
  stripe_metadata_status?: IProductStatus;
  tags: {
    [key :string ]: {
      ranking : number
      id: string
    }
  }, 
  secondary_tags: {
    [key :string ]: {
      ranking : number
      id: string
    }
  },
  list_tags: {
    [key :string ]: {
      ranking : number
      id: string
    }
  }
  price_id: string;
  price: number;
}
export enum IProductStatus {
  AVAILABLE = 0,
  OUT_OF_STOCK,
}

interface IDelivery {
  min_payment: number;
  max_fee: number;
  min_fee: number;
}

export interface IWarehouse {
  id: string;
  name: string;
  owner: string;
  delivery: IDelivery;
  alchohol_time: number[];
  start_time: number[];
  close_time: number[];
  active: boolean;
}

export const prodConverter: FirestoreDataConverter<IProducts> = {
  toFirestore(products: IProducts): DocumentData {
    return products;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): IProducts {
    const data = snapshot.data()!;
    return data as IProducts;
  },
};

export const warehouseConverter: FirestoreDataConverter<IWarehouse> = {
  toFirestore(products: IWarehouse): DocumentData {
    return products;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): IWarehouse {
    const data = snapshot.data()!;
    return data as IWarehouse;
  },
};

export const genericConverter = <T>() => ({
  toFirestore<T>(obj: T): DocumentData {
    return obj;
  },
  fromFirestore<T>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
    const data = snapshot.data()!;
    return data as T;
  },
});

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.sass'],
})
export class ProductsComponent implements OnInit {
  products$ = new BehaviorSubject<IProducts[]>([]);
  selectedWarehouse: IWarehouse | null = null;
  questions: any = null;
  form!: FormGroup;
  file!: File | null;
  currProd!: IProducts;
  loading = false;

  @ViewChild('edit_prod_drawer') editDrawer!: MatDrawer;
  @ViewChild('new_prod_drawer') newDrawer!: MatDrawer;

  searchForm = new FormControl();

  constructor(
    private readonly afs: Firestore,
    private readonly functions: Functions,
    private readonly storage: StorageService,
    private readonly warehouse: WarehouseService,
    private qcs: QuestionControlService
  ) {
    const prods$ = this.loadProducts();

    prods$.subscribe((prods) => {
      this.products$.next(prods);
    });

    this.searchForm.valueChanges.subscribe((userInput) => {
      this.searchProd(userInput);
    });
  }

  ngOnInit(): void {
    this.questions = this.qcs.product_questionaire();
    this.form = this.qcs.toFormGroup(this.questions.questions);
  }

  editQuestions(product: IProducts) {
    this.editDrawer.toggle();
    this.form.enable();
    this.questions = this.qcs.product_questionaire();
    this.currProd = product;
    this.questions.questions[0].options[0].value = true;
    const question: QuestionBase<any>[] = this.qcs.mapToQuestion(
      this.questions.questions,
      product
    );
    this.form = this.qcs.toFormGroup(question);
  }

  newQuestions() {
    this.newDrawer.toggle();
    this.form.enable();
    this.questions = this.qcs.product_questionaire();
    this.form = this.qcs.toFormGroup(this.questions.questions);
  }

  setImage(fileEvent: File) {
    this.file = fileEvent;
  }

  loadProducts() {
    return this.warehouse.selectedWarehouse$.pipe(
      switchMap((warehouse) => {
        if (warehouse === null) {
          return of([]);
        }
        let product_collection = collection(
          this.afs,
          'stripe_products'
        ).withConverter(prodConverter);
        this.selectedWarehouse = warehouse;
        if (warehouse?.name !== 'General') {
          product_collection = collection(
            this.afs,
            `warehouse/${warehouse.id}/stripe_products`
          ).withConverter(prodConverter);
        }
        const q = query<IProducts>(
          product_collection,
          orderBy('stripe_metadata_brand', 'desc')
        );
        return collectionData<IProducts>(q, {
          idField: 'id',
        }).pipe(
          map((prod) => {
            return prod;
          })
        );
      })
    );
  }

  async searchProd(search: string) {
    const prodName: string = search.toLowerCase();
    if (prodName == '' || this.products$.value == []) {
      const prods = await firstValueFrom(this.loadProducts());
      console.log(prods);
      this.products$.next(prods);
    } else {
      const prods = this.products$.value.filter((v) => {
        const hasBrand = v.stripe_metadata_brand
          .toLowerCase()
          .includes(prodName);
        const hasType = v.stripe_metadata_type.toLowerCase().includes(prodName);
        return v.name.toLowerCase().includes(prodName) || hasBrand || hasType;
      });
      this.products$.next(prods);
    }
  }

  getProduct() {
    const product = this.form.value as IProducts;
    const metadata = Object.keys(product)
      .filter((v) => v.includes('stripe_metadata'))
      .map((key: string) => {
        return {
          key: key.replace('stripe_metadata_', ''),
          value: this.form.get(key)?.value,
        };
      })
      .reduce((obj: any, item) => ((obj[item.key] = item.value), obj), {});

    if (this.warehouse.selectedWarehouse$.value?.name !== 'General') {
      metadata['warehouse'] = this.warehouse.selectedWarehouse$.value?.id;
    } else {
      metadata['warehouse'] = '-';
    }

    const stripe_product = {
      name: product.name,
      active: product.active,
      metadata: metadata || [],
    };
    return stripe_product;
  }

  async productFunction(event = 'product.create') {
    const stripe_product = this.getProduct();
    const product = this.form.value as IProducts;
    this.form.disable();
    this.loading = true;

    const downloadUrl = await this.storage.postPicture(
      this.file as File,
      'stripe_products',
      product.name
    );

    const prodFunction = httpsCallable(this.functions, 'stripeActionsFunc');

    const prod$ = prodFunction({
      event,
      product: stripe_product,
      price: product.price,
      images: [downloadUrl],
      description: product.description,
    });
    lastValueFrom(prod$).then((res) => {
      this.loading = false;
      this.file = null;
      this.newDrawer.toggle();
    });
  }


  async updateProduct() {
    const product = this.form.value as IProducts;
    const stripe_product = {
      images: [''],
      description: product.description,
      ...this.getProduct(), // Returns the product object
    };
    this.loading = true;

    if (this.file != null) {
      const downloadUrl: string = await this.storage.postPicture(
        this.file as File,
        'stripe_products',
        product.name
      );
      stripe_product.images = [downloadUrl];
    } else {
      stripe_product.images = this.currProd.images as string[];
    }

    if (this.warehouse.selectedWarehouse$.value?.name == 'General') {
      const prodFunction = httpsCallable(this.functions, 'stripeActionsFunc'); //Creates product in Strip
      const prod$ = prodFunction({
        event: 'product.update',
        product_id: this.currProd.id,
        product: stripe_product,
        price: product.price,
        price_id: this.currProd.price_id,
      });
      await lastValueFrom(prod$);
    } else { //Updates in Firestore
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${this.currProd.id}`
      );
      try {
        // Explicitly assigns products data to currProd
        this.currProd.price = product.price;
        this.currProd.active = product.active;
        this.currProd.name = product.name;
        this.currProd.description = product.description;
        this.currProd.availability = product.availability || 100;
        this.currProd.stripe_metadata_brand = product.stripe_metadata_brand;
        this.currProd.stripe_metadata_type = product.stripe_metadata_type;
        this.currProd.stripe_metadata_discount =
          product.stripe_metadata_discount == ''
            ? null
            : product.stripe_metadata_discount;
        this.currProd.images = stripe_product.images;
        
        await setDoc(docRef, { ...this.currProd }, { merge : true});
      } catch (e) {
        console.error(e);
      }
    }
    this.file = null;
    this.loading = false;
    this.editDrawer.toggle();
  }

  async deleteProd(product: IProducts) {
    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${product.id}`
    );
    await deleteDoc(docRef);
  }
}
