import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

@Injectable()
export class LoginService {

    private readonly http = inject(HttpClient)

    login(username: string, password: string) {
        const headers = new HttpHeaders()
            .set('username', username)
            .set('password', password)

        return firstValueFrom(this.http.get<Object>('/api/login', { headers }))
            
    }

    signup(form: any) {
        const headers = new HttpHeaders()
            .set('username', form['username'])
            .set('password', form['password'])

        const params = new HttpParams()
            .set('firstname', form['firstname'])
            .set('lastname', form['lastname'])
            .set('gender', form['gender'])
            .set('email', form['email'])

        return firstValueFrom(this.http.post<Object>("/api/signup", params, {headers}));
    }

}