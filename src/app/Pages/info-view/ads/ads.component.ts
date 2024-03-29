import { Component, OnInit, Type, ViewChild } from '@angular/core';
import {
  collection,
  Firestore,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTabChangeEvent } from '@angular/material/tabs';

import {
  deleteDoc,
  doc,
  deleteField,
  setDoc,
  Timestamp,
} from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';

import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  map,
  of,
  switchMap,
} from 'rxjs';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { BrandService } from 'src/app/Services/brand.service';
import { IAds } from 'src/app/Services/QuestionsService/product_questionaire';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { StorageService } from 'src/app/Services/storage.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import {
  genericConverter,
  IProducts,
  IWarehouse,
} from '../products/products.component';

export type AdStatus = 'expired' | 'active';
export type AdListType = 'tags' | 'secondary_tags' | 'list_tags';

@Component({
  selector: 'app-products',
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.sass'],
})
export class AdsComponent implements OnInit {
  data$ = new BehaviorSubject<IAds[]>([]);
  selectedAdType$ = new BehaviorSubject<AdListType>('tags');
  selectedType = new BehaviorSubject<AdStatus>('expired');

  selectedWarehouse: IWarehouse | null = null;
  selectedAd!: IAds;
  questions: any = null;
  form!: UntypedFormGroup;
  file!: File | null;
  loading = false;
  path: string = 'ads';
  prod_path: string = '';

  status: AdStatus[] = ['expired', 'active'];
  tags: AdListType[] = ['tags', 'secondary_tags', 'list_tags'];

  @ViewChild('edit_prod_drawer') editDrawer!: MatDrawer;
  @ViewChild('new_prod_drawer') newDrawer!: MatDrawer;
  @ViewChild('list_drawer') listDrawer!: MatDrawer;

  searchForm = new UntypedFormControl();

  constructor(
    private readonly afs: Firestore,
    private readonly storage: StorageService,
    private readonly warehouse: WarehouseService,
    private readonly brand: BrandService,
    private readonly qcs: QuestionControlService
  ) {
    this.loadData().subscribe((ads) => {
      this.data$.next(ads);
    });

    this.searchForm.valueChanges.subscribe((userInput) => {
      this.searchProd(userInput);
    });

    this.warehouse.selectedWarehouse$.subscribe((w) => {
      this.prod_path = `warehouse/${w?.id}/stripe_products`;
    });
  }

  ngOnInit(): void {
    this.questions = this.qcs.ad_questionaire();
    this.form = this.qcs.toFormGroup(this.questions.questions);
  }

  newQuestions() {
    this.newDrawer.toggle();
    this.form.enable();
    this.questions = this.qcs.ad_questionaire();
    this.form = this.qcs.toFormGroup(this.questions.questions);
  }

  setImage(fileEvent: File) {
    this.file = fileEvent;
  }

  loadData() {
    return combineLatest([
      this.warehouse.selectedWarehouse$,
      this.selectedType,
      this.selectedAdType$,
    ]).pipe(
      switchMap(([warehouse, selectedType, adType]) => {
        if (warehouse === null) {
          return of([]);
        }
        let collectionRef = collection(this.afs, this.path).withConverter<IAds>(
          genericConverter<IAds>()
        );
        this.selectedWarehouse = warehouse;
        if (warehouse?.name !== 'General') {
          collectionRef = collection(
            this.afs,
            `warehouse/${warehouse.id}/${this.path}`
          ).withConverter<IAds>(genericConverter<IAds>());
        }
        let q = query(collectionRef);
        const currDate = new Date(Date.now());
        if (selectedType === 'expired') {
          q = query(
            collectionRef,
            where('expirationDate', '<', Timestamp.fromDate(currDate)),
            where('ad_type', '==', adType)
          );
        } else {
          q = query(
            collectionRef,
            where('expirationDate', '>', Timestamp.fromDate(currDate)),
            where('ad_type', '==', adType)
          );
        }
        return collectionData<IAds>(q, {
          idField: 'id',
        }).pipe(
          map((prods) => {
            prods = prods.map((p) => {
              p.expirationDate = (p.expirationDate as Timestamp).toDate();
              p.ranking = p.ranking == undefined ? 0 : p.ranking
              return p;
            });
           
            prods.sort((a,b) => a.ranking - b.ranking)
            return prods;
          })
        );
      })
    );
  }

  async searchProd(search: string) {
    const searchField: string = search.toLowerCase();
    if (searchField == '' || this.data$.value.length == 0) {
      const ads = await firstValueFrom(this.loadData());
      this.data$.next(ads);
    } else {
      const ads = this.data$.value.filter((v) => {
        const hasTitle = v.title.toLowerCase().includes(searchField);
        const hasType = v.type?.toLowerCase().includes(searchField) || false;
        return hasTitle || hasType;
      });
      this.data$.next(ads);
    }
  }

  editQuestions(ad: IAds) {
    this.editDrawer.toggle();
    this.questions = this.qcs.ad_questionaire();
    this.selectedAd = ad;
    this.questions.questions[0].options[0].value = true;
    const questions: QuestionBase<any>[] = this.qcs.mapToQuestion(
      this.questions.questions,
      ad
    );
    this.form = this.qcs.toFormGroup(questions);
    this.form.enable();
  }

  changedTab(event: MatTabChangeEvent) {
    this.selectedType.next(this.status[event.index] as AdStatus);
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.id === o2.id;
  }

  selectAdEvent(ad_type: AdListType) {
    this.selectedAdType$.next(ad_type);
  }

  storeOrder(adList: IAds[]) {
    const promises = adList.map((element, i) => {
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/${this.path}/${element.id}`
      );
      if (this.warehouse.selectedWarehouse$.value?.name === 'General') {
        docRef = doc(this.afs, `${this.path}/${element.id}`);
      }

      try {
        this.file = null;
        return setDoc(
          docRef,
          {
            ranking: i,
          },
          { merge: true }
        );
      } catch (e) {
        alert(e);
        return null;
      }
    });

    if (promises) {
      Promise.all(promises);
    }
  }

  listProds(ads: IAds) {
    this.listDrawer.toggle();
    this.selectedAd = ads;
    this.brand.brand_filters$.next([
      [where(`${this.selectedAdType$.value}.${ads.id}.id`, '==', ads.id)],
      [],
    ]);
  }

  async objectAction(event: string, drawer: MatDrawer) {
    const collectionRef = collection(this.afs, this.path);
    let data = this.form.value as IAds;

    data.expirationDate = Timestamp.fromDate(data.expirationDate as Date);

    let id = doc(collectionRef).id;

    this.form.disable();
    this.loading = true;

    if (event == 'update') {
      id = this.selectedAd.id as string;
    } else {
      const downloadUrl = await this.storage.postPicture(
        this.file as File,
        this.path,
        data.title
      );
      data.content_url = downloadUrl;
    }

    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/${this.path}/${id}`
    );
    if (this.warehouse.selectedWarehouse$.value?.name === 'General') {
      docRef = doc(this.afs, `${this.path}/${id}`);
    }

    try {
      await setDoc(docRef, {
        warehouse_id: this.warehouse.selectedWarehouse$.value?.id || '',
        ...data,
      });
      this.file = null;
    } catch (e) {
      alert(e);
    }

    this.loading = false;
    this.form.enable();
    drawer.toggle();
  }

  async deleteObj(ad: IAds) {
    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/${this.path}/${ad.id}`
    );
    await deleteDoc(docRef);
  }

  saveProd(prods: IProducts[]) {
    prods.forEach((product, i) => {
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${product.id}`
      );

      product[this.selectedAdType$.value] = product[this.selectedAdType$.value] !== undefined ? product[this.selectedAdType$.value] : {};
      product[this.selectedAdType$.value][this.selectedAd.id] = {
        ranking: i,
        id: this.selectedAd.id,
      };
      setDoc(docRef, product, { merge: true });
    });
  }

  deleteProd(products: IProducts[]) {
    products.map((product) => {
      const ad = this.selectedAd;
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${product.id}`
      );
      updateDoc(docRef, { [`${[this.selectedAdType$.value] }.${ad.id}`]: deleteField() });
    })
  }
}
