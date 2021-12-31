import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { collection, Firestore, query } from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';

import { doc, FirestoreDataConverter, orderBy, QueryDocumentSnapshot, setDoc } from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { httpsCallable } from 'rxfire/functions';
import { BehaviorSubject, EMPTY, lastValueFrom, map, Observable, of, switchMap, takeLast, tap, withLatestFrom } from 'rxjs';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { StorageService } from 'src/app/Services/storage.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

export interface IProducts {
  id: number;
  active: boolean;
  images: string[] | string;
  name: string;
  description: string;
  metadata?: Map<string, string>[];
  stripe_metadata_color: string;
  stripe_metadata_type: string;
  stripe_metadata_brand: string;
  stripe_metadata_discount?: number;
  stripe_metadata_status?: IProductStatus;
  price_id: string;
  price: number;
}
export enum IProductStatus {
  AVAILABLE = 0,
  OUT_OF_STOCK
}

export interface IWarehouse {
  id: string;
  name: string;
  owner: string;
}

export const prodConverter: FirestoreDataConverter<IProducts> = {
  toFirestore(products: IProducts): DocumentData {
    return products
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): IProducts {
    const data = snapshot.data()!;
    return data as IProducts
  },
};

export const warehouseConverter: FirestoreDataConverter<IWarehouse> = {
  toFirestore(products: IWarehouse): DocumentData {
    return products
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): IWarehouse {
    const data = snapshot.data()!;
    return data as IWarehouse
  },
};

export const genericConverter = <T>() => ({
  toFirestore<T>(obj: T): DocumentData {
    return obj
  },
  fromFirestore<T>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
    const data = snapshot.data()!;
    return data as T
  },
})


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.sass']
})
export class ProductsComponent implements OnInit {

  products$: Observable<IProducts[]>;
  questions: any = null;
  form!: FormGroup;
  file!: File | null;
  currProd!: IProducts;
  loading = false;

  @ViewChild("edit_prod_drawer") editDrawer!: MatDrawer;
  @ViewChild("new_prod_drawer") newDrawer!: MatDrawer;

  searchForm = new FormControl();


  constructor(
    private readonly afs: Firestore,
    private readonly functions: Functions,
    private readonly storage: StorageService,
    private readonly warehouse: WarehouseService,
    private qcs: QuestionControlService
  ) {
    const product_collection = collection(this.afs, 'stripe_products').withConverter(prodConverter)
    const q = query<IProducts>(
      product_collection, orderBy("stripe_metadata_brand", "desc"))


    this.products$ = this.loadProducts();

    this.searchForm.valueChanges.subscribe(userInput => {
      this.searchProd(userInput)
    })

    this.products$.subscribe()
  }



  ngOnInit(): void {
    this.questions = this.qcs.product_questionaire();
    this.form = this.qcs.toFormGroup(
      this.questions.questions
    );
  }

  editQuestions(product: IProducts) {
    this.editDrawer.toggle()
    this.form.enable()
    this.questions = this.qcs.product_questionaire();
    this.currProd = product;
    this.questions.questions[0].options[0].value = true;
    const questions: QuestionBase<string>[] = this.qcs.mapToQuestion(this.questions.questions, product)
    this.form = this.qcs.toFormGroup(
      questions
    );
  }

  newQuestions() {
    this.newDrawer.toggle()
    this.form.enable()
    this.questions = this.qcs.product_questionaire();
    this.form = this.qcs.toFormGroup(
      this.questions.questions
    );
  }

  setImage(fileEvent: File) {
    this.file = fileEvent;
  }

  loadProducts() {
    return this.warehouse.selectedWarehouse$.pipe(switchMap((warehouse) => {
      if (warehouse === null) {
        return of([]);
      }
      let product_collection = collection(this.afs, 'stripe_products').withConverter(prodConverter)
      if (warehouse?.name !== "General") {
        product_collection = collection(this.afs, `warehouse/${warehouse.id}/stripe_products`).withConverter(prodConverter)
      }
      const q = query<IProducts>(
        product_collection, orderBy("stripe_metadata_brand", "desc"))
      return collectionData<IProducts>(q, {
        idField: "id"
      }).pipe(map((prod) => {
        return prod
      }))
    }))
  }

  async searchProd($event: any) {
    console.log($event);
    const prodName: string = $event.toLowerCase();

    if (prodName === '') {
      this.products$ = this.loadProducts();
    } else {
      let prods = await lastValueFrom(this.products$)

      prods = prods.filter((v) => {
        const hasBrand = v.stripe_metadata_brand.toLowerCase().includes(prodName);
        const hasType = v.stripe_metadata_type.toLowerCase().includes(prodName);
        return (v.name.toLowerCase().includes(prodName) || hasBrand || hasType);
      });
      this.products$ = of(prods);
    }
  }

  getProduct() {
    const product = (this.form.value as IProducts)
    const metadata = Object.keys(product).filter(v => v.includes("stripe_metadata")).map((key: string) => {
      return {
        key: key.replace("stripe_metadata_", ""),
        value: this.form.get(key)?.value
      }
    }).reduce((obj: any, item) => (obj[item.key] = item.value, obj), {});


    if (this.warehouse.selectedWarehouse$.value?.name !== "General") {
      metadata["warehouse"] = this.warehouse.selectedWarehouse$.value?.id
    }
    else {
      metadata["warehouse"] = "-"
    }

    const stripe_product = {
      name: product.name,
      active: product.active,
      metadata: metadata || [],
    }
    return stripe_product
  }

  async productFunction(event = "product.create") {
    const stripe_product = this.getProduct();
    const product = (this.form.value as IProducts)
    this.form.disable()
    this.loading = true;

    const downloadUrl = await this.storage.postPicture(this.file as File, "stripe_products", product.name)

    const prodFunction = httpsCallable(this.functions, "stripeActionsFunc");

    const prod$ = prodFunction({
      event,
      product: stripe_product,
      price: product.price,
      images: [downloadUrl],
      description: product.description
    })
    lastValueFrom(prod$).then((res) => {
      this.loading = false;
      this.file = null;
      this.newDrawer.toggle();
    })
  }

  async updateProduct() {
    const product = (this.form.value as IProducts)
    const stripe_product = {
      images: [""],
      description: product.description,
      ...this.getProduct()
    }
    this.loading = true;

    if (this.file != null) {
      const downloadUrl: string = await this.storage.postPicture(this.file as File, "stripe_products", product.name)
      stripe_product.images = [downloadUrl]
    } else {
      stripe_product.images = this.currProd.images as string[]
    }


    if (this.warehouse.selectedWarehouse$.value?.name == "General") {
      const prodFunction = httpsCallable(this.functions, "stripeActionsFunc");
      const prod$ = prodFunction({
        event: 'product.update',
        product_id: this.currProd.id,
        product: stripe_product,
        price: product.price,
        price_id: this.currProd.price_id
      })

      lastValueFrom(prod$).then((res) => {
        console.log(res)
        this.file = null;
        this.loading = false;
        this.editDrawer.toggle();
      })
    } else {
      let docRef = doc(this.afs, `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${this.currProd.id}`)
      try {
        this.currProd.price = product.price;
        await setDoc(docRef, { warehouse_id: this.warehouse.selectedWarehouse$.value?.id || "", ...this.currProd });
        this.file = null;
      } catch (e) {
        console.error(e);
      }
      this.editDrawer.toggle();
    }
  }
}