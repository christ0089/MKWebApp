import { Component, OnInit, ViewChild } from '@angular/core';
import { collection, Firestore, doc } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { deleteDoc, orderBy, query, setDoc, where } from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import {
  BehaviorSubject,
  firstValueFrom,
  map,
  of,
  switchMap,
} from 'rxjs';
import { ICategoryData } from 'src/app/Models/DataModels';
import { QuestionBase } from 'src/app/Models/Forms/question-base';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { BrandService } from 'src/app/Services/brand.service';
import { QuestionControlService } from 'src/app/Services/QuestionsService/question-control-service';
import { StorageService } from 'src/app/Services/storage.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import {
  genericConverter,
  IProducts,
  IWarehouse,
} from '../products/products.component';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.sass']
})
export class DepartmentComponent implements OnInit {
  departments$: BehaviorSubject<ICategoryData[]> = new BehaviorSubject([]);
  selectedWarehouse: IWarehouse | null = null;
  searchForm = new FormControl();

  questions: any = null;
  form!: FormGroup;
  file!: File | null;
  currBrand!: ICategoryData;
  loading = false;


  @ViewChild('edit_prod_drawer') editDrawer!: MatDrawer;
  @ViewChild('new_brand_drawer') newDrawer!: MatDrawer;
  @ViewChild('prod_drawer') prodDrawer!: MatDrawer;

  constructor(
    private readonly afs: Firestore,
    private readonly warehouse: WarehouseService,
    private readonly authService: AuthService,
    private readonly storage: StorageService,
    private readonly qcs: QuestionControlService
  ) {
    this.loadCategories().subscribe((cat) => {
      this.departments$.next(cat || []);
    });

    this.searchForm.valueChanges.subscribe((userInput) => {
      this.searchProd(userInput);
    });
  }

  loadCategories() {
    return this.warehouse.selectedWarehouse$.pipe(
      switchMap((warehouse) => {
        if (warehouse === null) {
          return of(null);
        }
        let brand_collection = collection(
          this.afs,
          'category'
        ).withConverter<ICategoryData>(genericConverter<ICategoryData>());
        this.selectedWarehouse = warehouse;
        if (warehouse?.name !== 'General') {
          brand_collection = collection(
            this.afs,
            `warehouse/${warehouse.id}/category`
          ).withConverter<ICategoryData>(genericConverter<ICategoryData>());
        }
        const q = query(brand_collection);
        return collectionData<ICategoryData>(q, {
          idField: 'id',
        }).pipe(
          map((categories) => {
            return categories;
          })
        );
      })
    );
  }

  ngOnInit(): void { }

  editQuestions(brand: ICategoryData) {
    this.editDrawer.toggle();
    this.questions = this.qcs.department_questions(this.authService.userData$.value.role);
    this.currBrand = brand;
    this.questions.questions[0].options[0].value = true;
    const questions: QuestionBase<any>[] = this.qcs.mapToQuestion(
      this.questions.questions,
      brand
    );
    this.form = this.qcs.toFormGroup(questions);
    this.form.enable();
  }

  newQuestions() {
    this.newDrawer.toggle();
    this.questions = this.qcs.department_questions(this.authService.userData$.value.role);
    this.form = this.qcs.toFormGroup(this.questions.questions);
    this.form.enable();
  }

  async brandAction(event: string, drawer: MatDrawer) {
    const collectionRef = collection(this.afs, 'brands');
    let brandData = this.form.value as ICategoryData;
    let id = doc(collectionRef).id;

    this.form.disable();
    this.loading = true;

    if (event == 'brand.update') {
      id = this.currBrand.id as string;
    } else {
      const downloadUrl = await this.storage.postPicture(
        this.file as File,
        'brands',
        brandData.name
      );
      brandData.img = downloadUrl;
    }

    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/category/${id}`
    );
    if (this.warehouse.selectedWarehouse$.value?.name === 'General') {
      docRef = doc(this.afs, `brands/${id}`);
    }
    try {
      await setDoc(docRef, {
        warehouse_id: this.warehouse.selectedWarehouse$.value?.id || '',
        ...brandData,
      });
      this.file = null;
    } catch (e) {
      alert(e);
    }

    this.loading = false;
    this.form.enable();
    drawer.toggle();
  }

  storeOrder(brandsList: ICategoryData[]) {
    const promises = brandsList.map((element, i) => {
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/category/${element.id}`
      );

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
      Promise.all(promises).catch(e => console.error(e));
    }
  }

  async deleteBrand(brand: ICategoryData | IProducts) {
    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/category/${brand.id}`
    );
    if (this.warehouse.selectedWarehouse$.value?.name === 'General') {
      docRef = doc(this.afs, `brands/${brand.id}`);
    }
    await deleteDoc(docRef).catch((e) => {
      console.log(e);
    });
  }

  setImage(fileEvent: File) {
    this.file = fileEvent;
  }


  async searchProd(search: string) {
    const searchTerm: string = search.toLowerCase();
    if (searchTerm == '') {
      const brands = (await firstValueFrom(this.loadCategories())) || [];
      this.departments$.next(brands);
    } else {
      let brandData = this.departments$.value;
      brandData = brandData.filter((v) => {
        const hasBrand = v.name.toLowerCase().includes(searchTerm);
        const hasType = v.type.toLowerCase().includes(searchTerm);
        return hasBrand || hasType;
      });
      this.departments$.next(brandData);
    }
  }

  saveProd(prods: IProducts[]) {
    const promises = prods.map((product, i) => {
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${product.id}`
      );
      product.ranking = i
      return setDoc(docRef, product, { merge: true });
    });
    if (promises) {
      Promise.all(promises).catch(e => console.error(e));
    }
  }

  deleteProd(products: IProducts[]) {
    products.map(product => {
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/stripe_products/${product.id}`
      );
      deleteDoc(docRef)
    })
  }
}
