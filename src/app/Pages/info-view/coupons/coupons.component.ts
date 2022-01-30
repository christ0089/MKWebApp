import { Component, OnInit, ViewChild } from '@angular/core';
import { collection, Firestore, setDoc } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { doc, query, where } from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, map, Observable, of, switchMap } from 'rxjs';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { coupon_questionaire } from 'src/app/Services/QuestionsService/product_questionaire';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter, IWarehouse, warehouseConverter } from '../products/products.component';


export interface ICoupon {
  expirationDate: any;
  active: boolean;
  code: string;
  requiered_products: boolean;
  requiered_product_quantity: number;
  requiered_min_purchase: boolean;
  min_purchase: number;
  key: string[];
  type: 'brands' | 'types' | 'products';
  discount_type: 'fixed' | 'percent';
  coupon_type: 'user' | 'store' | 'referral';
  discount: number;
  id: string;
}


@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.sass']
})
export class CouponsComponent implements OnInit {
  obj$: Observable<ICoupon[]>;
  selectedWarehouse: IWarehouse | null = null

  questions: any = null;
  form!: FormGroup;
  file!: File | null;
  currBrand!: ICoupon;
  loading = false;

  @ViewChild("edit_prod_drawer") editDrawer!: MatDrawer;
  @ViewChild("new_prod_drawer") newDrawer!: MatDrawer;

  constructor(
    private readonly afs: Firestore,
    private readonly warehouse: WarehouseService,
    private readonly qcs: QuestionControlService
  ) {


    this.obj$ = this.warehouse.selectedWarehouse$.pipe(switchMap((warehouse) => {
      if (warehouse === null) {
        return of([]);
      }
      let brand_collection = collection(this.afs, "coupons").withConverter<ICoupon>(genericConverter<ICoupon>())
      this.selectedWarehouse = warehouse;
      if (warehouse?.name !== "General")  {
        brand_collection = collection(this.afs, `warehouse/${warehouse.id}/coupons`).withConverter<ICoupon>(genericConverter<ICoupon>())
      }
      console.log(warehouse.id)
      const q = query(brand_collection, where("coupon_type", "==", "store"))
      return collectionData<ICoupon>(q, {
        idField: "id"
      }).pipe(map((prod) => {
        console.log(prod)
        return prod
      }))
    }))
  }

  ngOnInit(): void {

  }


  editQuestions(coupon: ICoupon) {
    this.questions = this.qcs.coupon_questionaire();
    this.currBrand = coupon;
    const questions: QuestionBase<any>[] = this.qcs.mapToQuestion(this.questions.questions, coupon)
    this.form = this.qcs.toFormGroup(
      questions
    );
    this.newDrawer.toggle()
    console.log(questions);
  }

  newQuestions() {

    this.questions = this.qcs.coupon_questionaire();
    this.form = this.qcs.toFormGroup(
      this.questions.questions
    );
    this.newDrawer.toggle()
  }

  async couponsAction(event: string, drawer: MatDrawer) {
    const collectionRef = collection(this.afs, "coupons")
    let id = doc(collectionRef).id;
    let brandData = this.form.value as ICoupon;

    this.form.disable();
    this.loading = true;

    if (event == "coupon.update") {
      id = this.currBrand.id as string;
    }

    let docRef = doc(this.afs, `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/coupons/${id}`)
    if (this.warehouse.selectedWarehouse$.value?.name === "General") {
      docRef = doc(this.afs, `coupons/${id}`)
    }
    console.log(this.warehouse.selectedWarehouse$.value?.name)

    try {
      await setDoc(docRef, { warehouse_id: this.warehouse.selectedWarehouse$.value?.id || "", ...brandData });
      this.file = null;
    } catch (e) {
      alert(e);
      console.error(e);
    }

    this.loading = false;
    this.form.enable();
    drawer.toggle();
  }
  
  setImage(fileEvent: File) {
    this.file = fileEvent;
  }
}

