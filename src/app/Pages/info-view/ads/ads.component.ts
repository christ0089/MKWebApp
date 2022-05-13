import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { collection, Firestore, query } from '@angular/fire/firestore';
import { Functions } from '@angular/fire/functions';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';

import { deleteDoc, doc, orderBy, setDoc } from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
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
import { IAds } from 'src/app/Services/QuestionsService/product_questionaire';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { StorageService } from 'src/app/Services/storage.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import {
  genericConverter,
  IProducts,
  IWarehouse,
  prodConverter,
} from '../products/products.component';

@Component({
  selector: 'app-products',
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.sass'],
})
export class AdsComponent implements OnInit {
  data$ = new BehaviorSubject<IAds[]>([]);
  currData!: IAds;
  selectedWarehouse: IWarehouse | null = null;
  questions: any = null;
  form!: FormGroup;
  file!: File | null;
  currProd!: IProducts;
  loading = false;
  path: string = 'ads';

  @ViewChild('edit_prod_drawer') editDrawer!: MatDrawer;
  @ViewChild('new_prod_drawer') newDrawer!: MatDrawer;

  searchForm = new FormControl();

  constructor(
    private readonly afs: Firestore,
    private readonly storage: StorageService,
    private readonly warehouse: WarehouseService,
    private qcs: QuestionControlService
  ) {
    this.loadData().subscribe((ads) => {
      this.data$.next(ads);
    });

    this.searchForm.valueChanges.subscribe((userInput) => {
      this.searchProd(userInput);
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
    return this.warehouse.selectedWarehouse$.pipe(
      switchMap((warehouse) => {
        if (warehouse === null) {
          return of([]);
        }
        let collectionRef = collection(
          this.afs,
          this.path
        ).withConverter<IAds>(genericConverter<IAds>());
        this.selectedWarehouse = warehouse;
        if (warehouse?.name !== 'General') {
          collectionRef = collection(
            this.afs,
            `warehouse/${warehouse.id}/${this.path}`
          ).withConverter<IAds>(genericConverter<IAds>());
        }
        const q = query(collectionRef);
        return collectionData<IAds>(q, {
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
    const searchField: string = search.toLowerCase();
    if (searchField == '' || this.data$.value == []) {
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
    this.currData = ad;
    this.questions.questions[0].options[0].value = true;
    const questions: QuestionBase<any>[] = this.qcs.mapToQuestion(
      this.questions.questions,
      ad
    );
    this.form = this.qcs.toFormGroup(questions);
    this.form.enable();
  }

  async objectAction(event: string, drawer: MatDrawer) {
    const collectionRef = collection(this.afs, this.path);
    let data = this.form.value as IAds;
    let id = doc(collectionRef).id;

    this.form.disable();
    this.loading = true;

    if (event == 'update') {
      id = this.currData.id as string;
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
}
