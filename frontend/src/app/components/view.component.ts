import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Place, Travel } from '../model';
import { TravelService } from '../services/travel.service';
import { Observable, Subscription, from } from 'rxjs';
import { WeatherService } from '../services/weather.service';
import { Store } from '@ngrx/store';
import { selectTravelById } from '../state/travel.selector';
import { addTravel } from '../state/travel.action';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrl: './view.component.css'
})
export class ViewComponent {

  private readonly router = inject(Router)
  private readonly travelService = inject(TravelService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly weatherService = inject(WeatherService)
  private readonly directionsService = new google.maps.DirectionsService()
  private readonly directionsRenderer = new google.maps.DirectionsRenderer()
  private readonly store = inject(Store)

  sub$!: Subscription
  trip$: Observable<Travel>

  places: Place[] = [];
  addressError: string | null = null;
  map: google.maps.Map | null = null;
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
    this.trip$ = this.store.select(selectTravelById(this.tripId))

      this.trip$.subscribe({
        next: async (trip : any) => {
          if(!trip) {
            await this.travelService.getTravelDetail(this.token, this.tripId)
            .then((value: any) => {
              console.info(value.trip)
              this.trip = JSON.parse(value.trip)
              this.trip.places.forEach((place: string) => {
                this.places.push(JSON.parse(place))
              });
              this.trip.places=this.places
              const travel: Travel = this.trip
              this.store.dispatch(addTravel({travel}))
            })
          } else {
            this.trip = trip
            this.places = this.trip.places
          }
          const mapElement = document.getElementById('map') as HTMLElement;
          // add markers and focus the map on the last marker
          this.map = new google.maps.Map(mapElement, {
            center: { lat: 1.2908306, lng: 103.7764078 },
            zoom: 15
          });
  
          this.updateExistingAddresses()
          console.info('>>>> COMPLETED')
        },
        error: value => console.error('>>> ERROR promise -> observable: ', value)
      })
  }

  updateExistingAddresses() {
    //update map marker
    for(var i=0; i<this.places.length; ++i) {
      this.updateMap(this.places[i].lat, this.places[i].lon, this.places[i].address)
    }
  }


  updateMap(lat: number, lng: number, address: string) {
    if (this.map) {
      const location = new google.maps.LatLng(lat, lng);
      this.map.setCenter(location);
      this.map.setZoom(15);

      new google.maps.Marker({
        position: location,
        map: this.map,
        title: address
      });
    }
  }

  calculateRoute(p: any): void {
    var idx = this.places.indexOf(p);

    this.directionsRenderer.setMap(this.map);
    this.directionsRenderer.setPanel(document.getElementById("sidebar") as HTMLElement);

    const destination = { lat: p.lat, lng: p.lon }; 
    const origin = { lat: this.places[idx-1].lat, lng: this.places[idx-1].lon }; 

    this.directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.TRANSIT
      }).then((response) => {
        this.directionsRenderer.setDirections(response);
        console.log(response)
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
