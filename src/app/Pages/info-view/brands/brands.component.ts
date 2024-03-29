import { Component, OnInit, ViewChild } from '@angular/core';
import { collection, Firestore, doc } from '@angular/fire/firestore';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { deleteDoc, orderBy, query, setDoc, where } from '@firebase/firestore';
import { collectionData } from 'rxfire/firestore';
import {
  BehaviorSubject,
  EMPTY,
  firstValueFrom,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { IBrands, ICategory } from 'src/app/Models/DataModels';
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
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.sass'],
})
export class BrandsComponent implements OnInit {
  brands$: BehaviorSubject<ICategory> = new BehaviorSubject({});
  selectedWarehouse: IWarehouse | null = null;
  searchForm = new UntypedFormControl();

  questions: any = null;
  form!: UntypedFormGroup;
  file!: File | null;
  currBrand!: IBrands;
  loading = false;

  @ViewChild('edit_prod_drawer') editDrawer!: MatDrawer;
  @ViewChild('new_brand_drawer') newDrawer!: MatDrawer;
  @ViewChild('prod_drawer') prodDrawer!: MatDrawer;

  constructor(
    private readonly afs: Firestore,
    private readonly warehouse: WarehouseService,
    private readonly authService: AuthService,
    private readonly storage: StorageService,
    private readonly brands: BrandService,
    private readonly qcs: QuestionControlService
  ) {
    this.loadBrands().subscribe((cat) => {
      this.brands$.next(cat || {});
    });

    this.searchForm.valueChanges.subscribe((userInput) => {
      this.searchProd(userInput);
    });
  }

  loadBrands() {
    return this.warehouse.selectedWarehouse$.pipe(
      switchMap((warehouse) => {
        if (warehouse === null) {
          return of(null);
        }
        let brand_collection = collection(
          this.afs,
          'brands'
        ).withConverter<IBrands>(genericConverter<IBrands>());
        this.selectedWarehouse = warehouse;
        if (warehouse?.name !== 'General') {
          brand_collection = collection(
            this.afs,
            `warehouse/${warehouse.id}/brands`
          ).withConverter<IBrands>(genericConverter<IBrands>());
        }
        const q = query(brand_collection);
        return collectionData<IBrands>(q, {
          idField: 'id',
        }).pipe(
          map((brands) => {
            const categories: ICategory = {};
            brands.forEach((brand) => {
              if (!(brand.category in categories)) {
                brand.ranking = brand.ranking || 0;
                categories[brand.category] = [brand];
              } else {
                brand.ranking = brand.ranking || 0;
                categories[brand.category].push(brand);
              }
            });
            Object.keys(categories).forEach((element) => {
              categories[element] = categories[element].sort(
                (a, b) => a.ranking - b.ranking
              );
            });
            return categories;
          })
        );
      })
    );
  }

  ngOnInit(): void { }

  editQuestions(brand: IBrands) {
    this.editDrawer.toggle();
    this.questions = this.qcs.brand_questions(this.authService.userData$.value.role);
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
    this.questions = this.qcs.brand_questions(this.authService.userData$.value.role);
    this.form = this.qcs.toFormGroup(this.questions.questions);
    this.form.enable();
  }

  async brandAction(event: string, drawer: MatDrawer) {
    const collectionRef = collection(this.afs, 'brands');
    let brandData = this.form.value as IBrands;
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
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/brands/${id}`
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

  storeOrder(brandsList: IBrands[]) {
    const promises = brandsList.map((element, i) => {
      let docRef = doc(
        this.afs,
        `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/brands/${element.id}`
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

  async deleteBrand(brand: IBrands | IProducts) {
    let docRef = doc(
      this.afs,
      `warehouse/${this.warehouse.selectedWarehouse$.value?.id}/brands/${brand.id}`
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

  openBrandProd(brand: IBrands) {
    this.brands.prod$.next(null);
    this.brands.brand$.next(brand as IBrands);
    this.brands.brand_filters$.next([
      [
        where('stripe_metadata_brand', '==', brand.brand),
        where('stripe_metadata_type', '==', brand.type),
        orderBy('ranking', 'asc')
      ],
      [
        where('stripe_metadata_brand', '==', brand.brand),
        where('stripe_metadata_type', '==', brand.type)
       
      ],
    ]);
    this.prodDrawer.toggle();
  }

  async searchProd(search: string) {
    const searchTerm: string = search.toLowerCase();
    if (searchTerm == '') {
      const brands = (await firstValueFrom(this.loadBrands())) || {};
      this.brands$.next(brands);
    } else {
      const brandData = this.brands$.value;
      Object.keys(this.brands$.value).forEach((key) => {
        brandData[key] = brandData[key].filter((v) => {
          const hasBrand = v.name.toLowerCase().includes(searchTerm);
          const hasType = v.type.toLowerCase().includes(searchTerm);
          return hasBrand || hasType;
        });
      });
      this.brands$.next(brandData);
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
