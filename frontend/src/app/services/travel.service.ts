import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { Travel } from "../model";

@Injectable()
export class TravelService {
    
    private readonly http = inject(HttpClient)
    private readonly router = inject(Router)

    getTripsSummary(token: string) {
        if(token == null) {
            this.router.navigate(['/'])
        }
        const headers = new HttpHeaders().set('token', token)

        return firstValueFrom(this.http.get<Object>('/api/travel/summary', { headers }))
    }

    createTravel(travel: Travel, token: string) {

        const headers = new HttpHeaders().set('token', token)

        return firstValueFrom(this.http.post<Object>('/api/travel', travel, { headers }))
    }

    async getTravelDetail(token: string, id: string) {
        if(token == null) {
            this.router.navigate(['/'])
        }
        const headers = new HttpHeaders().set('token', token)

        return firstValueFrom(this.http.get<Object>(`/api/travel/${id}`, { headers }))
    }

    updateTravelDetails(travel: Travel, token: string) {
        const headers = new HttpHeaders().set('token', token)

        return firstValueFrom(this.http.post<Object>('/api/travel/update', travel, { headers }))
    }

    deleteTrip(token: string, id: string) {
        if(token == null) {
            this.router.navigate(['/'])
        }
        //console.log("testing")
        const headers = new HttpHeaders().set('token', token)

        return firstValueFrom(this.http.delete<Object>(`/api/travel/${id}`, { headers }))
    }

    sendTripEmail(token: string, id: string) {
        const headers = new HttpHeaders().set('token', token)

        return firstValueFrom(this.http.get<Object>(`/api/travel/sendEmail/${id}`, { headers }))
    }
}