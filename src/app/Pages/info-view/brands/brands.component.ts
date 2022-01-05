import { Component, OnInit, ViewChild } from '@angular/core';
import { collection, Firestore, doc } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { orderBy, query, setDoc, where } from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import { BehaviorSubject, EMPTY, map, Observable, of, switchMap } from 'rxjs';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { StorageService } from 'src/app/Services/storage.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { genericConverter, IWarehouse, warehouseConverter } from '../products/products.component';

export interface IBrands {
  brand: string;
  buildActive: boolean,
  category: string,
  img: string,
  name: string,
  type: string,
  warehouse: string
  id?: string;
}

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.sass']
})
export class BrandsComponent implements OnInit {

  brands$: Observable<IBrands[]>;
  selectedWarehouse: IWarehouse | null = null

  questions: any = null;
  form!: FormGroup;
  file!: File | null;
  currBrand!: IBrands;

  loading = false;

  @ViewChild("edit_prod_drawer") editDrawer!: MatDrawer;
  @ViewChild("new_prod_drawer") newDrawer!: MatDrawer;

  constructor(
    private readonly afs: Firestore,
    private readonly warehouse: WarehouseService,
    private readonly storage: StorageService,
    private readonly qcs: QuestionControlService
  ) {

    this.brands$ = this.warehouse.selectedWarehouse$.pipe(switchMap((warehouse) => {
      if (warehouse === null) {
        return of([]);
      }
      let brand_collection = collection(this.afs, "brands").withConverter<IBrands>(genericConverter<IBrands>())
      this.selectedWarehouse = warehouse;
      if (warehouse?.name !== "General")  {
        brand_collection = collection(this.afs, `warehouse/${warehouse.id}/brands`).withConverter<IBrands>(genericConverter<IBrands>())
      }
      console.log(warehouse.id)
      const q = query(brand_collection)
      return collectionData<IBrands>(q, {
        idField: "id"
      }).pipe(map((prod) => {
        console.log(prod)
        return prod
      }))
    }))
  }

  ngOnInit(): void {

  }

  editQuestions(brand: IBrands) {
    this.editDrawer.toggle()
    this.questions = this.qcs.brand_questionaire();
    this.currBrand = brand;
    this.questions.questions[0].options[0].value = true;
    const questions: QuestionBase<string>[] = this.qcs.mapToQuestion(this.questions.questions, brand)
    this.form = this.qcs.toFormGroup(
      questions
    );
    this.form.enable()
  }

  newQuestions() {
    this.newDrawer.toggle()
    this.questions = this.qcs.brand_questionaire();
    this.form = this.qcs.toFormGroup(
      this.questions.questions
    );
    this.form.enable()
  }


  async brandAction(event: string, drawer: MatDrawer) {
    const collectionRef = collection(this.afs, "brands")
    let brandData = this.form.value as IBrands;
    let id = doc(collectionRef).id
  
    this.form.disable()
    this.loading = true;

    if (event == "brand.update") {
      id = this.currBrand.id as string;
    }
    else {
      const downloadUrl = await this.storage.postPicture(this.file as File, "brands", brandData.name)
      brandData.img = downloadUrl;
    }

    let docRef = doc(this.afs, `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/brands/${id}`)
    if (this.warehouse.selectedWarehouse$.value?.name === "General") {
      
      docRef = doc(this.afs, `brands/${id}`)
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
