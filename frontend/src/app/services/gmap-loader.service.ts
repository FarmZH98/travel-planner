import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

@Injectable()
export class GoogleMapsLoaderService {

  private geocoder: google.maps.Geocoder;

  constructor() {
    this.geocoder = new google.maps.Geocoder();
  }

  getCoordinates(address: string): Promise<{ lat: number, lng: number }> {
    return new Promise<{ lat: number, lng: number }>((resolve, reject) => {
      //const geocoder = new google.maps.Geocoder();
      this.geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          reject(status);
        }
      });
    });
  }

  reverseGeocode(lat: number, lng: number): Promise<string> {
    const latlng = { lat, lng };
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          console.log(results[0])
          resolve(results[0].formatted_address); 
        } else {
          reject(status);
        }
      });
    });
  }
}