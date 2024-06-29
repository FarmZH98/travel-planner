import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

@Injectable()
export class GoogleMapsLoaderService {
  private apiKey: string = environment.googleMapsApiKey;

  constructor() { }

  // load(): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     if (typeof google === 'object' && typeof google.maps === 'object') {
  //       resolve();
  //       return;
  //     }
  //     const script = document.createElement('script');
  //     script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
  //     script.async = true;
  //     script.defer = true;
  //     script.onload = () => resolve();
  //     script.onerror = (error: any) => reject(error);
  //     document.head.appendChild(script);
  //   });
  // }

  getCoordinates(address: string): Promise<{ lat: number, lng: number }> {
    return new Promise<{ lat: number, lng: number }>((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          reject('Geocode was not successful for the following reason: ' + status);
        }
      });
    });
  }
}