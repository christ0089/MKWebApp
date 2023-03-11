import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IWarehouse } from 'src/app/Pages/info-view/products/products.component';
import { AuthService } from 'src/app/Services/Auth/auth.service';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

@Component({
  selector: 'app-dragable-list',
  templateUrl: './dragable-list.component.html',
  styleUrls: ['./dragable-list.component.sass'],
})
export class DragableListComponent implements OnInit {
  @Input() brands!: any[];
  @Output() toggleEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() toggleDel: EventEmitter<any> = new EventEmitter<any>();
  @Output() openBrandProd: EventEmitter<any> = new EventEmitter<any>();
  @Output() orderRanking: EventEmitter<any[]> = new EventEmitter<
    any[]
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

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.brands, event.previousIndex, event.currentIndex);
  }

  editBrand(brand: any) {
    this.toggleEdit.emit(brand);
  }


  deleteBrand(brand: any) {
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

  openBrand(brand: any) {
    this.openBrandProd.emit(brand);
  }
}
