import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../environments/environment";
import { Subject, firstValueFrom, map, tap } from "rxjs";
import { WeatherData } from "../model";

@Injectable()
export class WeatherService {
    private readonly http = inject(HttpClient)
    private apiKey: string = environment.openWeatherApiKey;
    //onWeather = new Subject<WeatherData[]>()

    //https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
    getWeather(lat: number, lon: number) {
        const queryString = new HttpParams()
        .set('lat', lat)
        .set('lon', lon)
        .set('appid', this.apiKey)

        return firstValueFrom(
        this.http.get<WeatherData[]>('https://api.openweathermap.org/data/2.5/weather'
            , { params: queryString })
            .pipe(tap(result => console.info('BEFORE: ', result)),
                map((result: any) =>
                    {
                        return {
                            icon: result.weather[0].icon,
                            main: result.weather[0].main,
                            description: result.weather[0].description,
                            city: result.name
                        } as WeatherData
                    }
                    // (result['weather'] as any[]) // cast to an array
                    // .map(value => {
                    //     return {
                    //     icon: value['icon'],
                    //     main: value['main'],
                    //     description: value['description'],
                    //     } as WeatherData
                    // }) // WeatherData[]
                )
            // , // map()
            // tap(result => {
            //     console.info(">>> in tap: ", result)
            //     // firing the onWeather with result
            //     this.onWeather.next(result)
            // }) // WeatherData[]
            ) // pipe() -> Observable<WeatherData[]>
        ) // firstValueFrom() -> Promise<WeatherData[]>
    }
}