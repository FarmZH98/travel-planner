import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../services/gmap-loader.service';
import { Place, Travel } from '../model';
import { TravelService } from '../services/travel.service';
import { Subscription, from } from 'rxjs';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent {

  private readonly router = inject(Router)
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService)
  private readonly travelService = inject(TravelService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly weatherService = inject(WeatherService)

  sub$!: Subscription

  address: string = '';
  addresses: any[] = [];
  places: Place[] = [];
  addressError: string | null = null;
  map: google.maps.Map | null = null;
  marker: google.maps.Marker | null = null;
  markers: any[] = [];
  trip: any;
  token: string = ''
  tripId: string = ''
  weather: any;

  async ngOnInit(){
    //check for token
    this.token = localStorage.getItem('token');
    if(localStorage.getItem('token') == null) {
      this.router.navigate(['/'])
    } 

    //get value and input into form
    this.tripId = this.activatedRoute.snapshot.queryParams['id']
    this.sub$ = from(this.travelService.getTravelDetail(this.token, this.tripId))
      .subscribe({
        next: (value : any) => {
          console.info(value.trip)
          this.trip = JSON.parse(value.trip)
          this.trip.places.forEach((place: string) => {
            this.places.push(JSON.parse(place))
          });
          const mapElement = document.getElementById('map') as HTMLElement;
          // add markers and focus the map on the last marker
          this.map = new google.maps.Map(mapElement, {
            center: { lat: 1.2908306, lng: 103.7764078 },
            zoom: 15
          });
        },
        error: value => console.error('>>> ERROR promise -> observable: ', value),
        complete: () => 
          {
            this.updateExistingAddresses()
            console.info('>>>> COMPLETED')
          }
      })
  }

  updateExistingAddresses() {
    console.log(this.places[0].lat)

    //update map marker
    for(var i=0; i<this.places.length; ++i) {
      this.updateMap(this.places[i].lat, this.places[i].lon)
    }
  }


  updateMap(lat: number, lng: number) {
    if (this.map) {
      const location = new google.maps.LatLng(lat, lng);
      this.map.setCenter(location);
      this.map.setZoom(15);

      new google.maps.Marker({
        position: location,
        map: this.map,
        title: this.address
      });
    }
  }

  calculateRoute(p: any): void {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    console.log("im here")
    var idx = this.places.indexOf(p);

    directionsRenderer.setMap(this.map);
    directionsRenderer.setPanel(document.getElementById("sidebar") as HTMLElement);

    const origin = { lat: p.lat, lng: p.lon }; // Example origin (San Francisco)
    const destination = { lat: this.places[idx-1].lat, lng: this.places[idx-1].lon }; // Example destination (Los Angeles)

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT
      }).then((response) => {
        directionsRenderer.setDirections(response);
      })
      .catch((e) => window.alert("Directions request failed due to " + e.message));
  }

  isRouteVisible(p: any): boolean {
    
    if(this.places.indexOf(p)==0) return false

    return true
  }

  getWeather(place: any) {
    this.weatherService.getWeather(place.lat, place.lon)
    .then(
      (response: any) => {
         this.weather = response;
        console.log(response)
      }
    ).catch(error => {
      //alert(error.message)
      console.log(error)
    });
  }


  sendEmail() {
    this.travelService.sendTripEmail(this.token, this.tripId)
    .then((response : any) => {
      alert(response.response)
    }).catch(err => {
      alert(err.message)
    });
  }

  back() {
    this.router.navigate(['/home'])
  }

}
