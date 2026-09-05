import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of, shareReplay} from 'rxjs';
import { map, timeout, retry, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = environment.weatherApiUrl;
  private timeoutValueMs = environment.timeoutThresholdMs;
  private retryCount = 2
  private platformId = inject(PLATFORM_ID);
  private forecastCache$?: Observable<any>;

  constructor() {
  }

  getForecast(loc: string, lat: number, lon: number): Observable<any> {
    // check if SSR is ongoing
    if (isPlatformServer(this.platformId)) {
      return of(null);
    }

    // Return the cached stream if it already exists
    if (this.forecastCache$) {
      return this.forecastCache$;
    }

    // fire an http request with the given coordinates, timeout and retry count
    this.forecastCache$ = this.http.get<any>(`${this.apiUrl}/gridpoints/${loc}/${lat},${lon}/forecast`).pipe(
      timeout(this.timeoutValueMs),
      retry(this.retryCount),
      map(response => ({
        // period 1 is the next hour forecast
        period1: response.properties.periods.find((p: any) => p.number === 1),
        gridpoints: response.properties
      })),
      catchError(err => {
        console.error('WeatherService error:', err);
        return of({ errorActive: true });
      }),
      shareReplay(1)  // save data in memory (1 emission) and prevent multiple new HTTP calls
    );

    return this.forecastCache$;
  }

  // force a fresh data fetch
  clearCache(): void {
    this.forecastCache$ = undefined;
  }

}
