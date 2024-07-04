import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../services/gmap-loader.service';
import { Travel } from '../model';
import { TravelService } from '../services/travel.service';
import { WeatherService } from '../services/weather.service';
import { OllamaService } from '../services/ollama.service';


@Component({
  selector: 'app-new-entry',
  templateUrl: './new-entry.component.html',
  styleUrl: './new-entry.component.css'
})
export class NewEntryComponent implements OnInit {

  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService)
  private readonly travelService = inject(TravelService)
  private readonly weatherService = inject(WeatherService)

  form!: FormGroup

  clickedLocation: { lat: number; lng: number } | null = null;
  address: string = '';
  addresses: any[] = [];
  place: string = '';
  places: any[] = [];
  markers: any[] = [];
  latitude: number | null = null;
  longitude: number | null = null;
  addressError: string | null = null;
  map: google.maps.Map | null = null;
  marker: google.maps.Marker | null = null;
  token: string;
  weather: any;
  isCreated: boolean = false;

  //Ollama
  answers: any[] = [];
  questionSent: boolean = false;
  ollamaForm!: FormGroup;
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
    }, {
      validator: this.dateRangeValidator
    })


    const options = {
      //fields: ["address_components", "geometry", "icon", "name", "formatted_address"],
      fields: ["address_components", "name", "formatted_address", "url"],
      strictBounds: false,
    };

    const input = document.getElementById('address') as HTMLInputElement;
    //this.autocomplete = new google.maps.places.Autocomplete(input, options);
    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete?.getPlace();
      console.log(place)
      
      if (place && place.formatted_address) {
        //this.places.push(place);
        this.address = place.formatted_address;
        this.place = place.name
      }
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

  create() {
    const travel: Travel = {
      places: this.addresses,
      ...this.form.value
    }
    this.isCreated = true

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
    this.addresses.splice(idx, 1)
    this.markers[idx].setMap(null);
    this.markers.splice(idx, 1);
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
          //this.getWeather(this.latitude, this.longitude)
          const place = {address: this.address, lat: this.latitude, lon: this.longitude, name: this.place}
          this.places.push(place);
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
      this.ollamaService.chatWithOllama(text).then((response: any) => {
        console.log(response)
        const answer = {by: "Ollama", message: response.answer}
        this.answers.push(answer)
        this.questionSent = false;
      })
      .catch(err => {
        alert(err.message)
      });

      this.ollamaForm.reset();
    }
  }
  
}
