import { Component, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMapsLoaderService } from '../services/gmap-loader.service';
import { Loader } from "@googlemaps/js-api-loader"
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-new-entry',
  templateUrl: './new-entry.component.html',
  styleUrl: './new-entry.component.css'
})
export class NewEntryComponent implements OnInit {

  private readonly router = inject(Router)
  private readonly googleMapsLoader = inject(GoogleMapsLoaderService)

  form!: FormGroup
  // mapOptions: google.maps.MapOptions = {
  //   center: { lat: -34.397, lng: 150.644 },
  //   zoom: 8
  // };
  clickedLocation: { lat: number; lng: number } | null = null;

  ngOnInit(): void {
    //check for token
    const token = localStorage.getItem('token')
    if(token == null) {
      this.router.navigate(['/'])
    }

    let loader = new Loader({
      apiKey: environment.googleMapsApiKey,
      version: "weekly"
    });
    
    loader.load().then(() => {
      new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
      })
    })
  }

  create() {

  }

  
}




