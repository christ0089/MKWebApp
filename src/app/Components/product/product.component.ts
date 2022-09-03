import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { FormGroup } from '@angular/forms';
import { doc, QueryConstraint, setDoc } from '@firebase/firestore';
import { httpsCallable } from '@firebase/functions';
import {
  combineLatest,
  EMPTY,
} from 'rxjs';
import { IBrands } from 'src/app/Models/DataModels';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import {
  IProducts,
  IWarehouse,
} from 'src/app/Pages/info-view/products/products.component';
import { AuthService, UserData } from 'src/app/Services/Auth/auth.service';
import { BrandService } from 'src/app/Services/brand.service';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { StorageService } from 'src/app/Services/storage.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.sass'],
})
export class ProductComponent implements OnInit {
  
  selectedWarehouse: IWarehouse | null = null;
  questions: any = null;
  form!: FormGroup;
  file!: File | null;
  currProd!: IProducts;
  loading = false;
  event = "product.update"

  constructor(
    private readonly afs: Firestore,
    private readonly functions: Functions,
    private readonly storage: StorageService,
    private readonly warehouse: WarehouseService,
    private readonly brandService: BrandService,
    private readonly auth: AuthService,
    private qcs: QuestionControlService
  ) {
    combineLatest([
      this.brandService.prod$,
      this.brandService.brand$,
      this.warehouse.selectedWarehouse$,
      this.auth.userData$
    ]).subscribe(([prod, brand, selectedWarehouse]) => {
      if (!prod) {
        if (this.auth.isSuperAdmin === true && selectedWarehouse?.name === 'General') {
          this.newQuestions(brand);
          this.event = "product.create"
        } else {
          this.questions = null;
        }
        return;
      }
      this.editQuestions(prod);
    });
  }

  ngOnInit(): void {}

  setImage(fileEvent: File) {
    this.file = fileEvent;
  }

  editQuestions(product: IProducts) {
    if (this.form) {
      this.form.enable();
    } 
    this.questions = this.qcs.product_questionaire((this.auth.userData$.value as UserData).role);
    this.currProd = product;
    this.questions.questions[0].options[0].value = true;
    const question: QuestionBase<any>[] = this.qcs.mapToQuestion(
      this.questions.questions,
      product
    );
    this.form = this.qcs.toFormGroup(question);
  }

  newQuestions(brand: IBrands | null) {
    if (this.form) {
      this.form.enable();
    }
    this.questions = this.qcs.product_questionaire((this.auth.userData$.value as UserData).role);
    this.questions.questions[7].value = brand?.type || '';
    this.questions.questions[8].value = brand?.brand || '';

    console.log(this.questions);
    this.form = this.qcs.toFormGroup(this.questions.questions);
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

  async newProduct() {
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
      event: this.event,
      product: stripe_product,
      price: product.price,
      images: [downloadUrl],
      description: product.description,
    });
    prod$.then((res) => {
      this.loading = false;
      this.file = null;
    });
  }

  productFunction() {
    if (this.event === "product.update") {
      this.updateProduct()
    } else {
      this.newProduct()
    }
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
      const prodFunction = httpsCallable<any>(
        this.functions,
        'stripeActionsFunc'
      ); //Creates product in Strip
      const prod$ = prodFunction({
        event: 'product.update',
        product_id: this.currProd.id,
        product: stripe_product,
        price: product.price,
        price_id: this.currProd.price_id,
      });
      await prod$;
    } else {
      //Updates in Firestore
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

        await setDoc(docRef, { ...this.currProd }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    }
    this.file = null;
    this.loading = false;
  }
}
