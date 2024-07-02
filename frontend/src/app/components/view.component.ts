import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../services/gmap-loader.service';
import { Travel } from '../model';
import { TravelService } from '../services/travel.service';
import { Subscription, from } from 'rxjs';

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

  sub$!: Subscription

  address: string = '';
  addresses: any[] = [];
  places: any[] = [];
  addressError: string | null = null;
  map: google.maps.Map | null = null;
  marker: google.maps.Marker | null = null;
  markers: any[] = [];
  trip: any;
  token: string = ''
  tripId: string = ''

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
          console.log(new Date(this.trip.startDate))
        },
        error: value => console.error('>>> ERROR promise -> observable: ', value),
        complete: () => 
          {
            this.updateExistingAddresses()
            console.info('>>>> COMPLETED')
        
            const mapElement = document.getElementById('map') as HTMLElement;
            // add markers and focus the map on the last marker
            this.map = new google.maps.Map(mapElement, {
              center: { lat: 1.2908306, lng: 103.7764078 },
              zoom: 15
            });
        
          }
      })
  }

  updateExistingAddresses() {
    this.addresses = this.trip.places;
    console.log(this.trip.places)

    //update map marker
    for(var i=0; i<this.addresses.length; ++i) {
      this.address = this.addresses[i]
      console.log(this.address)
      this.googleMapsLoader.getCoordinates(this.address)
      .then(coordinates => {
        this.updateMap(coordinates.lat, coordinates.lng);
      })
      .catch(err => {
        this.addressError = err;
        console.log(this.addressError)
      });
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
