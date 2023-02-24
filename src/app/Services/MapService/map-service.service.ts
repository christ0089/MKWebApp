import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  markers =  new BehaviorSubject<any[]>([])
  driver_markers =  new BehaviorSubject<any[]>([])
  constructor() { }
}
