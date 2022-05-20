import { CdkDragEnd, CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-dragable-horizontal-list',
  templateUrl: './dragable-horizontal-list.component.html',
  styleUrls: ['./dragable-horizontal-list.component.sass'],
})
export class DragableHorizontalListComponent implements OnInit {
  @Input() elements!: any[];
  @Output() toggleEdit: EventEmitter<any> = new EventEmitter<any>();
  @Output() toggleDel: EventEmitter<any> = new EventEmitter<any>();
  @Output() openBrandProd: EventEmitter<any> = new EventEmitter<any>();
  @Output() orderRanking: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor() {}

  ngOnInit(): void {}

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

  edit(brand: any) {
    this.toggleEdit.emit(brand);
  }

  deleteEle(brand: any) {
    this.toggleDel.emit(brand);
  }

  open(brand: any) {
    this.openBrandProd.emit(brand);
  }



  
}
