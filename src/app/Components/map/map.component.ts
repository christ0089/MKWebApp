import { Component, Input, OnInit } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { tap } from 'rxjs';
import { MapService } from 'src/app/Services/MapService/map-service.service';
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
  markers: any[] = []
  tracking_markers = new Map<string, any>()

  constructor(
    private readonly mapService: MapService,
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

    this.mapService.markers.pipe(
      tap((markersData) => {
        this.markers.forEach(m => m.remove())
        this.markers = []
        console.log(markersData)

        markersData.forEach(markerData => {
          let marker = new mapboxgl.Marker().setLngLat(markerData.coords).addTo(this.map);
          this.markers.push(marker)

          this.map.flyTo({
            center: markerData.coords,
            essential: true, // this animation is considered essential with respect to prefers-reduced-motion
          });

          if (markerData.type === "order_start") {
            //TODO: Tracking Marker Cleaning
            this.tracking_markers = new Map()
            return
          }
          this.calculateRoutes(markerData.curr_coords, markerData.coords, markerData.id)
          if (!this.tracking_markers.has(markerData.id)) {
            const tracking_marker = new mapboxgl.Marker(this.createCustomMarker(), { offset: [0, -23] }).setLngLat(markerData.curr_coords).addTo(this.map);
            this.tracking_markers.set(markerData.id, {
              marker: tracking_marker
            })
            return
          }
          const updateMarker = this.tracking_markers.get(markerData.id).marker
          updateMarker
            .setLngLat(markerData.curr_coords)
          return
        })
      })).subscribe()

    this.mapService.driver_markers.pipe(
      tap((markersData) => {
        markersData.forEach(markerData => {
          if (!this.tracking_markers.has(markerData.id)) {
            const tracking_marker = new mapboxgl
                    .Marker(this.createCustomMarker(), { offset: [0, -23] })
                    .setLngLat(markerData.coords)
                    .addTo(this.map);
            this.tracking_markers.set(markerData.id, {
              marker: tracking_marker
            })
            return
          }
          const updateMarker = this.tracking_markers.get(markerData.id).marker
          updateMarker
            .setLngLat(markerData.coords)
          return
        })
      })).subscribe()
  }

  cleanTrackingMarkers() {
    // Check ids that dont exist on the tracking_marker and remove the marker
  }

  createCustomMarker() {
    const el = document.createElement('div');
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '15px';
    el.style.overflow = 'hidden';
    el.style.backgroundSize = 'cover';
    el.style.color = 'white';
    el.style.backgroundColor = 'red';
    el.style.padding = '5px';
    el.style.fontSize = '15px';
    el.style.textAlign = 'center';
    el.innerHTML = `<div></div>`;
    /* Assign a unique `id` to the marker. */
    el.id = 'marker-motor';
    /* Assign the `marker` class to each marker for styling. */
    el.className = 'marker';
    return el;
  }

  /**
  * 
  * @param start_cords 
  * @param end_cords 
  * @returns 
  */
  async calculateRoutes(start_cords: string[], end_cords: string[], id: string) {
    console.log(start_cords)
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start_cords[0]},${start_cords[1]};${end_cords[0]},${end_cords[1]}?steps=true&geometries=geojson&access_token=${environment.mapbox}`,
        { method: 'GET' }
      )
      const json = await query.json();
      const data = json.routes[0];
      const route = data.geometry.coordinates;

      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };
      // if the route already exists on the map, we'll reset it using setData
      if (this.map.getSource('route')) {
        this.map.getSource('route').setData(geojson);
      }
      // otherwise, we'll make a new request
      else {
        this.map.addLayer({
          id: id,
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#f70486',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
    } catch (e) {
      alert(e)
    }
  }
}
