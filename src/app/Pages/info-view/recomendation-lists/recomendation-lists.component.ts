import { Component, OnInit, ViewChild } from '@angular/core';
import { deleteField, Firestore, orderBy, updateDoc } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { collection, deleteDoc, doc, query, setDoc } from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, firstValueFrom, map, of, switchMap } from 'rxjs';
import { IRecommendedList } from 'src/app/Models/DataModels';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter, IProducts, IWarehouse } from '../products/products.component';

@Component({
  selector: 'app-recomendation-lists',
  templateUrl: './recomendation-lists.component.html',
  styleUrls: ['./recomendation-lists.component.sass']
})
export class RecomendationListsComponent implements OnInit {
  data$ = new BehaviorSubject<IRecommendedList[]>([]);

  createdList!: IRecommendedList; 
  searchForm = new FormControl();
  selectedWarehouse: IWarehouse | null = null;
  questions: any = null;
  form!: FormGroup;

  @ViewChild('edit_prod_drawer') editDrawer!: MatDrawer;
  @ViewChild('new_prod_drawer') newDrawer!: MatDrawer;


  constructor(
    private readonly warehouse: WarehouseService,
    private readonly qcs: QuestionControlService,
    private readonly afs: Firestore
  
  ) { 

    this.searchForm.valueChanges.subscribe((userInput) => {
      this.searchProd(userInput);
    });

    this.loadData().subscribe((cat) => {
      this.data$.next(cat || {});
    });
  }

  ngOnInit(): void {
  }


  loadData() {
    return this.warehouse.selectedWarehouse$.pipe(
      switchMap((warehouse) => {
        if (warehouse === null) {
          return of([]);
        }
        let product_collection = collection(
          this.afs,
          'recommended_list'
        ).withConverter<IRecommendedList>(genericConverter<IRecommendedList>());
        this.selectedWarehouse = warehouse;
        if (warehouse?.name !== 'General') {
          product_collection = collection(
            this.afs,
            `warehouse/${warehouse.id}/recommended_list`
          ).withConverter<IRecommendedList>(genericConverter<IRecommendedList>());
        }
        const q = query<IRecommendedList>(
          product_collection
        );
        return collectionData<IRecommendedList>(q, {
          idField: 'id',
        }).pipe(
          map((prods) => {
        
            return prods;
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
      const data = this.data$.value.filter((v) => {
        const hasName = v.name.toLowerCase().includes(searchField);
        return hasName;
      });
      this.data$.next(data);
    }
  }

  editQuestions(product: IProducts) {
    this.editDrawer.toggle();
    this.form.enable();
    this.questions = this.qcs.product_questionaire();
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

  async deleteList(brand: IRecommendedList | IProducts) {
    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/recommended_list/${brand.id}`
    );
    if (this.warehouse.selectedWarehouse$.value?.name === 'General') {
      docRef = doc(this.afs, `brands/${brand.id}`);
    }
    await deleteDoc(docRef).catch((e) => {
      console.log(e);
    });
  }

  saveProd(prods: IProducts[]) {
    prods.forEach((product, i) => {
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${product.id}`
      );

      product.list_tags = product.tags !== undefined ? product.tags : {}
      product.list_tags[this.createdList.id] = {
        ranking : i,
        id: this.createdList.id
      }
      setDoc(docRef, product, { merge: true });
    });
  }

  deleteProd(product: IProducts) {
    const list = this.createdList;
    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${product.id}`
    );
    updateDoc(docRef, { [`list_tags.${list.id}`]:  deleteField()});
  }

}
