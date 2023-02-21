import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { WarehouseService } from 'src/app/Services/WarehouseService/warehouse.service';
import { environment } from 'src/environments/environment';
declare let mapboxgl: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.sass']
})
export class MapComponent implements OnInit {
  
  map: any;
 
  constructor(
    private readonly warehouse: WarehouseService,
    private readonly firestore: Firestore
  ) {
  
  }

  ngOnInit(): void {

    mapboxgl.accessToken = environment.mapbox;
    this.map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v10',
      center: {
        lng: -102.5528,
        lat: 23.6345
      },
      zoom: 8,
      pitch: 55,
      container: 'mapbox',
      antialias: true,
    });

    this.map.on('load', async () => {
      this.map.addSource('zones', {
        type: 'geojson',
        // Use a URL for the value for the `data` property.
        data: "https://raw.githubusercontent.com/christ0089/PrtyGeoJson/main/map%20(2).geojson",
      });
      this.map.addLayer({
        id: 'avail_zones',
        type: 'fill',
        source: 'zones', // reference the data source
        layout: {},
        paint: {
          'fill-color': '#e70de0', // blue color fill
          'fill-opacity': 0.1,
        },
      });
    });
  }

}
