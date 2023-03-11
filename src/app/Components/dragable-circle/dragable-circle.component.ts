import { CdkDragDrop, CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-dragable-circle',
  templateUrl: './dragable-circle.component.html',
  styleUrls: ['./dragable-circle.component.sass']
})
export class DragableCircleComponent implements OnInit {


  @Input() elements!: any[];
  @Output() toggleEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() toggleDel: EventEmitter<any> = new EventEmitter<any>();
  @Output() openBrandProd: EventEmitter<any> = new EventEmitter<any>();
  @Output() orderRanking: EventEmitter<any[]> = new EventEmitter<
    any[]
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


  editBrand(brand: any) {
    this.toggleEdit.emit(brand);
  }

  deleteBrand(brand: any) {
    this.toggleDel.emit(brand);
  }

  openBrand(brand: any) {
    this.openBrandProd.emit(brand);
  }


}
