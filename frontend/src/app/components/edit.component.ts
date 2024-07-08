import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../services/gmap-loader.service';
import { Place, Travel } from '../model';
import { TravelService } from '../services/travel.service';
import { WeatherService } from '../services/weather.service';
import { Subscription, from } from 'rxjs';
import { OllamaService } from '../services/ollama.service';

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
  private readonly weatherService = inject(WeatherService)

  form!: FormGroup
  sub$!: Subscription

  clickedLocation: { lat: number; lng: number } | null = null;
  address: string = '';
  addresses: any[] = [];
  gplace: any;
  place: string = '';
  places: Place[] = [];
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
  weather: any;
  isEdited: boolean = false

  //Ollama
  answers: any[] = [];
  questionSent: boolean = false;
  ollamaForm!: FormGroup;
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
    this.sub$ = from(this.travelService.getTravelDetail(this.token, travelId))
      .subscribe({
        next: (value : any) => {
          console.info(value.trip)
          this.trip = JSON.parse(value.trip)
          this.trip.places.forEach((place: string) => {
            this.places.push(JSON.parse(place))
          });
          const options = {
            //fields: ["address_components", "geometry", "icon", "name", "formatted_address"],
            fields: ["address_components", "name", "formatted_address", "url"],
            strictBounds: false,
          };
      
          const input = document.getElementById('address') as HTMLInputElement;
          //this.autocomplete = new google.maps.places.Autocomplete(input, options);
          const autocomplete = new google.maps.places.Autocomplete(input, options);
          autocomplete.addListener('place_changed', () => {
            this.gplace = autocomplete?.getPlace();
            if (this.gplace && this.gplace.formatted_address) {
              this.address = this.gplace.formatted_address;
              this.place = this.gplace.name
            }
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
        
          }
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
    
    //this.places = this.trip.places;
    console.log(this.places[0].lat)

    //update map marker
    for(var i=0; i<this.places.length; ++i) {
      this.updateMap(this.places[i].lat, this.places[i].lon)
    }
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
          const place = {address: this.gplace.formatted_address, lat: this.latitude, lon: this.longitude, name: this.gplace.name, url: this.gplace.url}
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
      console.log(lat + " " + lng)
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


  update() {
    const travel: Travel = {
      places: this.places,
      id: this.trip.id,
      ...this.form.value
    }

    this.isEdited = true

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
