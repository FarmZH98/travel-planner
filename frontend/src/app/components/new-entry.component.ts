import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../services/gmap-loader.service';
import { Place, Travel } from '../model';
import { TravelService } from '../services/travel.service';
import { WeatherService } from '../services/weather.service';
import { OllamaService } from '../services/ollama.service';
import { Store } from '@ngrx/store';
import { addTravel } from '../state/travel.action';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-new-entry',
  templateUrl: './new-entry.component.html',
  styleUrl: './new-entry.component.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(100%)' })),
      transition('in => out', animate('300ms ease-in-out')),
      transition('out => in', animate('300ms ease-in-out'))
    ])
  ]
})
export class NewEntryComponent implements OnInit {

  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService)
  private readonly travelService = inject(TravelService)
  private readonly weatherService = inject(WeatherService)
  private readonly directionsService = new google.maps.DirectionsService()
  private readonly directionsRenderer = new google.maps.DirectionsRenderer()
  private readonly store = inject(Store)

  form!: FormGroup
  gplace: any;
  places: Place[] = [];
  markers: any[] = [];
  addressError: string | null = null;
  map: google.maps.Map | null = null;
  directions: google.maps.DirectionsResult;
  token: string;
  weather: any;
  isCreated: boolean = false;

  //Ollama
  answers: any[] = [];
  questionSent: boolean = false;
  ollamaForm!: FormGroup;
  ollamaPlaces : any[] = [];
  ollamaMainAnswer: string = '';
  ollamaVisible = false;
  private readonly ollamaService = inject(OllamaService)

  ngOnInit(): void {
    //check for token
    this.token = localStorage.getItem('token');
    if(localStorage.getItem('token') == null) {
      this.router.navigate(['/'])
    } 

    this.form = this.fb.group({
      title: this.fb.control<string>('', [ Validators.required]),
      notes: this.fb.control<string>(''),
      startdate: this.fb.control<string>('', [ Validators.required ]),
      enddate: this.fb.control<string>('', [ Validators.required ]),
      transportMode: this.fb.control<string>('TRANSIT', [ Validators.required ])
    })

    const options = {
      fields: ["address_components", "name", "formatted_address", "url"],
      strictBounds: false,
    };

    const input = document.getElementById('address') as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener('place_changed', () => {
      this.gplace = autocomplete?.getPlace();
      console.log(this.gplace)
      
      });

    const mapElement = document.getElementById('map') as HTMLElement;
    this.map = new google.maps.Map(mapElement, {
      center: { lat: 1.2908306, lng: 103.7764078 },
      zoom: 15
    });

    this.ollamaForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(3)]],
    });   

  }

  create() {
    const travel: Travel = {
      places: this.places,
      ...this.form.value
    }
    this.isCreated = true

    this.store.dispatch(addTravel({travel}))
    this.travelService.createTravel(travel, this.token).then(
      (response: any) => {
        console.log(response)
        this.router.navigate(['/home'])
      })
      .catch(err => {
        alert(err.message)
        console.log(err)
      });
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
          //this.getWeather(this.latitude, this.longitude)
          const place = {address: this.gplace.formatted_address, lat: coordinates.lat, lon: coordinates.lng, name: this.gplace.name, url: this.gplace.url}
          this.places.push(place);
          this.form.markAsDirty();
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
    var idx = this.places.indexOf(p);

    this.directionsRenderer.setMap(this.map);
    this.directionsRenderer.setPanel(document.getElementById("sidebar") as HTMLElement);

    const destination = { lat: p.lat, lng: p.lon }; 
    const origin = { lat: this.places[idx-1].lat, lng: this.places[idx-1].lon }; 
    const selectedMode = this.form.value.transportMode as keyof typeof google.maps.TravelMode;

    this.directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode[selectedMode]
      }).then((response) => {
        this.directionsRenderer.setDirections(response);
      })
      .catch((e) => window.alert("Directions request failed due to " + e.message));
  }

  isRouteVisible(p: any): boolean {
    
    if(this.places.indexOf(p)==0) return false

    return true
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

