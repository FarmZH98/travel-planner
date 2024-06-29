import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../services/gmap-loader.service';
import { Travel } from '../model';
import { TravelService } from '../services/travel.service';
import { Subscription, from } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent implements OnInit{
  //private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService)
  private readonly travelService = inject(TravelService)
  private readonly activatedRoute = inject(ActivatedRoute)

  form!: FormGroup
  sub$!: Subscription

  clickedLocation: { lat: number; lng: number } | null = null;
  address: string = '';
  addresses: any[] = [];
  latitude: number | null = null;
  longitude: number | null = null;
  addressError: string | null = null;
  map: google.maps.Map | null = null;
  marker: google.maps.Marker | null = null;
  markers: any[] = [];
  token: string;
  trip: any;
  range: FormGroup<any>;
  startDate: FormControl<any>;
  endDate: FormControl<any>;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: this.fb.control<string>("", [Validators.required]),
      notes: this.fb.control<string>(""),
      startdate: this.fb.control<string>("", [Validators.required]),
      enddate: this.fb.control<string>("", [Validators.required]),
    }, {
      validator: this.dateRangeValidator
    });
  }

  async ngOnInit(){
    //check for token
    this.token = localStorage.getItem('token') ?? '';

    if(localStorage.getItem('token') == '') {
      this.router.navigate(['/'])
    } 

    //get value and input into form
    const travelId = this.activatedRoute.snapshot.queryParams['id']
    this.sub$ = from(this.travelService.getTravelDetail(this.token, travelId))
      .subscribe({
        next: (value : any) => {
          console.info(value.trip)
          this.trip = JSON.parse(value.trip)
          console.log(new Date(this.trip.startDate))
        },
        error: value => console.error('>>> ERROR promise -> observable: ', value),
        complete: () => 
          {
            this.form.patchValue({
              title: this.trip.title, 
              notes: this.trip.notes, 
              startdate: new Date(this.trip.startDate),
              enddate: new Date(this.trip.endDate)
            })

            // this.startDate = new FormControl(new Date(this.trip.startDate))
            // this.endDate = new FormControl(new Date(this.trip.endDate))

            this.updateExistingAddresses()
            console.info('>>>> COMPLETED')
            const options = {
              fields: ["address_components", "geometry", "icon", "name", "formatted_address"],
              strictBounds: false,
            };
        
            const input = document.getElementById('address') as HTMLInputElement;
            //this.autocomplete = new google.maps.places.Autocomplete(input, options);
            const autocomplete = new google.maps.places.Autocomplete(input, options);
            autocomplete.addListener('place_changed', () => {
              const place = autocomplete?.getPlace();
              console.log(place)
              if (place && place.formatted_address) {
                this.address = place.formatted_address;
              }
              });
        
            const mapElement = document.getElementById('map') as HTMLElement;
            // add markers and focus the map on the last marker
            this.map = new google.maps.Map(mapElement, {
              center: { lat: 1.2908306, lng: 103.7764078 },
              zoom: 15
            });
        
          }
      })
  }

  dateRangeValidator(control: AbstractControl): { [key: string]: any } | null {
    const start = control.get('startdate')?.value;
    const end = control.get('enddate')?.value;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24) + 1; 
      if (dayDiff > 5) {
        return { 'dateRange': 'The app currently only supports a maximum of 5 days' };
      }
    }
    return null;
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

  getCoordinates() {
    if (this.address) {
      this.googleMapsLoader.getCoordinates(this.address)
        .then(coordinates => {
          this.latitude = coordinates.lat;
          this.longitude = coordinates.lng;
          this.addressError = null;
          console.log(coordinates)
          this.updateMap(coordinates.lat, coordinates.lng);
          this.addresses.push(this.address);
          //console.log(this.form.invalid)
        })
        .catch(err => {
          this.addressError = err;
          console.log(this.addressError)
          this.latitude = null;
          this.longitude = null;
        });
      }
    }

  updateMap(lat: number, lng: number) {
    if (this.map) {
      const location = new google.maps.LatLng(lat, lng);
      this.map.setCenter(location);
      this.map.setZoom(15);

      this.markers.push(new google.maps.Marker({
        position: location,
        map: this.map,
        title: this.address
      }));
    }
  }

  deleteAddress(address: string) {
    const idx = this.addresses.indexOf(address)
    this.addresses.splice(idx, 1)
    this.markers[idx].setMap(null);
    this.markers.splice(idx, 1);
  }

  update() {
    const travel: Travel = {
      places: this.addresses,
      id: this.trip.id,
      ...this.form.value
    }
    this.travelService.updateTravelDetails(travel, this.token).then(
      (response: any) => {
        console.log(response)
        this.router.navigate(['/home'])
      })
      .catch(err => {
        alert(err.message)
        console.log(err)
      });
    
  }

  deleteTrip() {
    this.travelService.deleteTrip(this.token, this.trip.id).then(
      (response: any) => {
        console.log(response)
        this.router.navigate(['/home'])
      })
      .catch(err => {
        alert(err.message)
        console.log(err)
      });
  }
}
