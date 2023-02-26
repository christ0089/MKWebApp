import { Component, OnInit, ViewChild } from '@angular/core';
import { collection, Firestore, setDoc } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { doc, query, where } from '@firebase/firestore';
import { on } from 'events';
import { type } from 'os';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, EMPTY, map, Observable, of, switchMap, tap } from 'rxjs';
import { IBrands } from 'src/app/Models/DataModels';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { coupon_questionaire } from 'src/app/Services/QuestionsService/product_questionaire';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter, IProducts, IWarehouse, warehouseConverter } from '../products/products.component';


export type ICouponType = 'brands' | 'types' | 'products';

export interface ICoupon {
  expirationDate: any;
  active: boolean;
  code: string;
  requiered_products: boolean;
  requiered_product_quantity: number;
  requiered_min_purchase: boolean;
  min_purchase: number;
  key: string[];
  type: ICouponType;
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
  obj$: Observable<ICoupon[]> = EMPTY;
  elements$: Observable<any[]> = EMPTY;
  addedElements$ = new BehaviorSubject<any[]>([]);
  selectedWarehouse: IWarehouse | null = null
  activeButtons: String[] = ["add"]
  activeButtons2: String[] = ["delete"]


  questions: any = null;
  form!: FormGroup;
  file!: File | null;
  currCoupon!: ICoupon;
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
      if (warehouse?.name !== "General") {
        brand_collection = collection(this.afs, `warehouse/${warehouse.id}/coupons`).withConverter<ICoupon>(genericConverter<ICoupon>())
      }
      console.log(warehouse.id)
      const q = query(brand_collection, where("coupon_type", "==", "store"))
      return collectionData<ICoupon>(q, {
        idField: "id"
      })
    }))

    this.questions = this.qcs.coupon_questionaire();
    this.form = this.qcs.toFormGroup(
      this.questions.questions
    );
  }

  couponListener = (couponForm: ICoupon) => {
    const warehouse = this.warehouse.selectedWarehouse$.value

    if (!warehouse) {
      alert("Failed to get Warehouse")
      return of([])
    }
    const type = this.typeMapping(couponForm.type)

    if (!type) {
      alert("Failed to get type")
      return of([])
    }

    let type_collection = collection(this.afs, type).withConverter<any>(genericConverter<any>())
    if (warehouse?.name !== "General") {
      type_collection = collection(this.afs, `warehouse/${warehouse.id}/${type}`).withConverter<any>(genericConverter<any>())
    }
    return collectionData(type_collection).pipe(map((obj) => {
      return this.objMapper(obj, type)
    }),
      tap((obj) => {
        if (this.currCoupon) {
          this.assignObjElements(obj, this.currCoupon.key)
          return
        }
        this.assignObjElements(obj, this.addedElements$.value)
      }) // Map Products to Added Elements 
    )
  }

  private assignObjElements(obj: any[], ids: string[]) {
    if (ids.length == 0) {
      return
    }


    ids.sort();
    obj.sort((a, b) => a.id - b.id);


    obj = obj.filter((o) => ids.includes(o.id))
    this.addedElements$.next(obj)
  }


  private objMapper(obj: any[], type: string) {
    console.log(obj)

    if (type === "stripe_products") {
      return obj.map((o: IProducts) => {
        return {
          id: o.id,
          name: o.name,
          content_url: o.images[0],
          visible: o.active
        }
      })
    }
    if (type === "brands") {
      return obj.map((o: IBrands) => {
        return {
          id: o.brand,
          name: o.name,
          content_url: o.img_circle,
          visible: o.visible
        }
      })
    }

    // if (type === "brands") {
    //   return obj.map((o: IBrands) => {
    //     return {
    //       id: o.type,
    //       name: o.type,
    //       content_url: o.img_circle,
    //       visible: o.visible
    //     }
    //   })
    // }
    return obj
  }

  private typeMapping(type: ICouponType) {
    switch (type) {
      case "products":
        return "stripe_products"
      case "brands":
        return "brands"
      case "types":
        return "brands"
      default:
        return null
    }
  }

  addObj(obj: any) {
    const list = this.addedElements$.value

    if (list.includes(obj)) { return } // Dont Add an already added product
    if (list.length >= 10) { 
      alert("The limit of items added is 10")
      return
     }
    list.push(obj)
    this.addedElements$.next(list)
  }

  deleteObj(obj: any) {
    let list = this.addedElements$.value
    list = list.filter(v => v.id !== obj.id)
    this.addedElements$.next(list)
  }


  ngOnInit(): void {

  }

  editQuestions(coupon: ICoupon) {
    this.questions = this.qcs.coupon_questionaire();
    this.currCoupon = coupon;
    const questions: QuestionBase<any>[] = this.qcs.mapToQuestion(this.questions.questions, coupon)
    this.form = this.qcs.toFormGroup(
      questions
    );
    this.newDrawer.toggle()
  }

  changedTab(event: MatTabChangeEvent) {
    // TODO: Add experiraiton filtering to coupons
  }

  newQuestions() {
    this.questions = this.qcs.coupon_questionaire();
    this.form = this.qcs.toFormGroup(
      this.questions.questions
    );

    this.elements$ = this.form.valueChanges.pipe(switchMap(this.couponListener))
    this.newDrawer.toggle()
  }

  async couponsAction(event: string, drawer: MatDrawer) {
    const collectionRef = collection(this.afs, "coupons")
    let id = doc(collectionRef).id;
    let currCoupon = this.form.value as ICoupon;
    currCoupon.key = this.addedElements$.value.map(obj => obj.id)

    this.form.disable();
    this.loading = true;

    if (event == "coupon.update") {
      id = this.currCoupon.id as string;
    }

    let docRef = doc(this.afs, `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/coupons/${id}`)
    if (this.warehouse.selectedWarehouse$.value?.name === "General") {
      docRef = doc(this.afs, `coupons/${id}`)
    }
    console.log(this.warehouse.selectedWarehouse$.value?.name)

    if (this.addedElements$.value.length > 0) {
      currCoupon.key = this.addedElements$.value.map((k) => k.id)
    }

    try {
      await setDoc(docRef, { warehouse_id: this.warehouse.selectedWarehouse$.value?.id || "", ...currCoupon });
    } catch (e) {
      alert(e);
      console.error(e);
    }

    this.loading = false;
    this.form.enable();
    drawer.toggle();
  }

}

