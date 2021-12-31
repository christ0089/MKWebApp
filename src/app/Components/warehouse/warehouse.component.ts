import { Component, OnInit } from '@angular/core';
import { EMPTY, map, Observable } from 'rxjs';
import { IWarehouse } from 'src/app/Pages/info-view/products/products.component';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';

@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.sass']
})
export class WarehouseComponent implements OnInit {
  warehouses$: Observable<IWarehouse[]> = EMPTY;
  selectedWarehouse$: Observable<IWarehouse | null> = EMPTY;

  constructor(private readonly warehouseService: WarehouseService) { 
    this.warehouses$ = this.warehouseService.warehouses$;
    this.selectedWarehouse$ = warehouseService.selectedWarehouse$.pipe(map((w) => w));
  }

  ngOnInit(): void {
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.id === o2.id;
  }

  selectWarehouse(warehouse: IWarehouse) {
    this.warehouseService.selectedWarehouse$.next(warehouse);
  }

}
