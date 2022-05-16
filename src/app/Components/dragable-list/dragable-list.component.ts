import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IBrands } from 'src/app/Models/DataModels';
import { IWarehouse } from 'src/app/Pages/info-view/products/products.component';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

@Component({
  selector: 'app-dragable-list',
  templateUrl: './dragable-list.component.html',
  styleUrls: ['./dragable-list.component.sass'],
})
export class DragableListComponent implements OnInit {
  @Input() brands!: IBrands[];
  @Output() toggleEdit: EventEmitter<IBrands> = new EventEmitter<IBrands>();
  @Output() toggleDel: EventEmitter<IBrands> = new EventEmitter<IBrands>();
  @Output() openBrandProd: EventEmitter<IBrands> = new EventEmitter<IBrands>();
  @Output() orderRanking: EventEmitter<IBrands[]> = new EventEmitter<
    IBrands[]
  >();
  selectedWarehouse!: IWarehouse;
  userRole: boolean = false;
  
  constructor(
    private readonly warehouse: WarehouseService,
    private readonly user: AuthService,
  ) {
    this.warehouse.selectedWarehouse$.subscribe(() => {
      this.selectedWarehouse;
    });
    this.userRole = this.user.isSuperAdmin;
  }

  ngOnInit(): void {}

  ngOnDestroy() {}

  drop(event: CdkDragDrop<IBrands[]>) {
    moveItemInArray(this.brands, event.previousIndex, event.currentIndex);
  }

  editBrand(brand: IBrands) {
    this.toggleEdit.emit(brand);
  }


  deleteBrand(brand: IBrands) {
    this.toggleDel.emit(brand);
  }

  storeOrder() {
    this.orderRanking.emit(
      this.brands.map((b, i) => {
        b.ranking = i;
        return b;
      })
    );
  }

  openBrand(brand: IBrands) {
    this.openBrandProd.emit(brand);
  }
}
