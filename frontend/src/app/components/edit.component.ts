import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../services/gmap-loader.service';
import { Place, Travel } from '../model';
import { TravelService } from '../services/travel.service';
import { WeatherService } from '../services/weather.service';
import { Observable, Subscription, from } from 'rxjs';
import { OllamaService } from '../services/ollama.service';
import { select, Store } from '@ngrx/store';
import { selectTravelById } from '../state/travel.selector';
import { addTravel, deleteTravel, updateTravel } from '../state/travel.action';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(100%)' })),
      transition('in => out', animate('300ms ease-in-out')),
      transition('out => in', animate('300ms ease-in-out'))
    ])
  ]
})
export class EditComponent implements OnInit{
  //private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService)
  private readonly travelService = inject(TravelService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly weatherService = inject(WeatherService)
  private readonly directionsService = new google.maps.DirectionsService();
  private readonly directionsRenderer = new google.maps.DirectionsRenderer();
  private readonly store = inject(Store)

  form!: FormGroup
  trip$: Observable<Travel>

  gplace: any;
  places: Place[] = [];
  addressError: string | null = null;
  map: google.maps.Map | null = null;
  markers: any[] = [];
  token: string;
  trip: any;
  weather: any;
  isEdited: boolean = false

  //Ollama
  answers: any[] = [];
  questionSent: boolean = false;
  ollamaForm!: FormGroup;
  ollamaPlaces : any[] = [];
  ollamaMainAnswer: string = '';
  ollamaVisible = false;
  private readonly ollamaService = inject(OllamaService)

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
    this.token = localStorage.getItem('token');
    if(localStorage.getItem('token') == null) {
      this.router.navigate(['/'])
    } 

    //get value and input into form
    const travelId = this.activatedRoute.snapshot.queryParams['id']
    this.trip$ = this.store.select(selectTravelById(travelId))

    this.trip$.subscribe({
      next: async (trip : any) => {
        console.log(trip)
        if(!trip) {
          await this.travelService.getTravelDetail(this.token, travelId)
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
        const options = {
          fields: ["address_components", "name", "formatted_address", "url"],
          strictBounds: false,
        };
    
        const input = document.getElementById('address') as HTMLInputElement;
        //this.autocomplete = new google.maps.places.Autocomplete(input, options);
        const autocomplete = new google.maps.places.Autocomplete(input, options);
        autocomplete.addListener('place_changed', () => {
          this.gplace = autocomplete?.getPlace();
        });
    
        const mapElement = document.getElementById('map') as HTMLElement;
        // add markers and focus the map on the last marker
        this.map = new google.maps.Map(mapElement, {
          center: { lat: 1.2908306, lng: 103.7764078 },
          zoom: 15
        });
        this.form.patchValue({
          title: this.trip.title, 
          notes: this.trip.notes, 
          startdate: new Date(this.trip.startDate),
          enddate: new Date(this.trip.endDate)
        })

        this.updateExistingAddresses()
        console.info('>>>> COMPLETED')
      },
      error: value => console.error('>>> ERROR promise -> observable: ', value)
    })

    this.ollamaForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
    });   
  
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

    //update map marker
    for(var i=0; i<this.places.length; ++i) {
      this.updateMapForExistingPlace(this.places[i].lat, this.places[i].lon, this.places[i].address)
    }
  }

  deleteAddress(place: any) {
    const idx = this.places.indexOf(place)
    this.places.splice(idx, 1)
    this.markers[idx].setMap(null);
    this.markers.splice(idx, 1);
  }

  getCoordinates() {
    const address=this.gplace.formatted_address
    if (address) {
      this.googleMapsLoader.getCoordinates(address)
        .then(coordinates => {
          this.addressError = null;
          console.log(coordinates)
          this.updateMap(coordinates.lat, coordinates.lng);
          const place = {address: this.gplace.formatted_address, lat: coordinates.lat, lon: coordinates.lng, name: this.gplace.name, url: this.gplace.url}
          this.places.push(place);
        })
        .catch(err => {
          this.addressError = err;
          console.log(this.addressError)
        });
      }
    }

  updateMapForExistingPlace(lat: number, lng: number, address: string) {
    if (this.map) {
      const location = new google.maps.LatLng(lat, lng);
      this.map.setCenter(location);
      this.map.setZoom(15);

      this.markers.push(new google.maps.Marker({
        position: location,
        map: this.map,
        title: address
      }));
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
        title: this.gplace.formatted_address
      }));
    }
  }

  calculateRoute(p: any): void {
    //const directionsService = new google.maps.DirectionsService();
    //const directionsRenderer = new google.maps.DirectionsRenderer();
    console.log("im here")
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
      })
      .catch((e) => window.alert("Directions request failed due to " + e.message));
  }

  isRouteVisible(p: any): boolean {
    
    if(this.places.indexOf(p)==0) return false

    return true
  }


  update() {
    const travel: Travel = {
      places: this.places,
      id: this.trip.id,
      ...this.form.value
    }

    this.isEdited = true
    this.store.dispatch(updateTravel({travel}))
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
    this.store.dispatch(deleteTravel(this.trip.id))
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

  back() {
    this.router.navigate(['/home'])
  }

  isFormDirty() {
    return this.form.dirty
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

  //referred from https://github.com/kenken64/ollama-app/blob/main/client/src/app/chat/
  sendMessage() {
    console.log("Sending...");
    if(this.ollamaForm.valid){
      const text = this.ollamaForm.value.text;
      const question = {by: "You", message: text}
      this.answers.push(question)
      console.log('User: ' + text);
      //this.messages.push({text: text, sender: 'User', timestamp: new Date()});
      this.questionSent = true;
      this.ollamaPlaces = []
      this.ollamaService.chatWithOllama(text).then((response: any) => {
        console.log(response)
        var responseFormatted = this.filterOllamaResponse(response.answer)
        const answer = {by: "Ollama", message: responseFormatted}
        this.answers.push(answer)
        this.questionSent = false;
      })
      .catch(err => {
        alert(err.message)
        console.log(err);
        this.questionSent = false;
      });
      this.ollamaForm.reset();
    }
  }

  filterOllamaResponse(responseRaw: string) {
    var response = JSON.parse(responseRaw.trim());

    response.Places.forEach((place : any) => {
      this.ollamaPlaces.push(place)
    }); 

    return response.Main
  }

  addOllamaPlace(ollamaPlace: any) {
    const address=ollamaPlace.Address
    if (address) {
      this.googleMapsLoader.getCoordinates(address)
        .then(coordinates => {
          this.addressError = null;
          console.log(coordinates)
          this.updateMapForExistingPlace(coordinates.lat, coordinates.lng, address);
          const place = {address: address, lat: coordinates.lat, lon: coordinates.lng, name: ollamaPlace.Place, url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          this.places.push(place);
        })
        .catch(err => {
          this.addressError = err;
          console.log(this.addressError)
        });
    }
  }
  
  toggleOllama() {
    this.ollamaVisible = !this.ollamaVisible;
  }
}
