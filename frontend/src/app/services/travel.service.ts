import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";

@Injectable()
export class TravelService {
    private readonly http = inject(HttpClient)
    private readonly router = inject(Router)

    getTravelDetails(token: string) {
        if(token == null) {
            this.router.navigate(['/'])
        }
        const headers = new HttpHeaders().set('token', token)

        return firstValueFrom(this.http.get<Object>('/api/travel', { headers }))
    }
}