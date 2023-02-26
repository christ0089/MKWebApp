import { CdkDragDrop, CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
import { IBrands } from 'src/app/Models/DataModels';

@Component({
  selector: 'app-dragable-circle',
  templateUrl: './dragable-circle.component.html',
  styleUrls: ['./dragable-circle.component.sass']
})
export class DragableCircleComponent implements OnInit {


  @Input() elements!: IBrands[];
  @Output() toggleEdit: EventEmitter<IBrands> = new EventEmitter<IBrands>();
  @Output() toggleDel: EventEmitter<IBrands> = new EventEmitter<IBrands>();
  @Output() openBrandProd: EventEmitter<IBrands> = new EventEmitter<IBrands>();
  @Output() orderRanking: EventEmitter<IBrands[]> = new EventEmitter<
    IBrands[]
  >();

  constructor() { }

  ngOnInit(): void {
  }


  dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder') as Element;
    phContainer.removeChild(phElement);
    phContainer.parentElement?.insertBefore(phElement, phContainer);

    moveItemInArray(this.elements, dragIndex, dropIndex);
  }

  storeOrder() {
    this.orderRanking.emit(
      this.elements.map((b, i) => {
        b.ranking = i;
        return b;
      })
    );
  }


  editBrand(brand: IBrands) {
    this.toggleEdit.emit(brand);
  }

  deleteBrand(brand: IBrands) {
    this.toggleDel.emit(brand);
  }

  openBrand(brand: IBrands) {
    this.openBrandProd.emit(brand);
  }


}
