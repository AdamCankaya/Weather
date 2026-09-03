import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, forkJoin, of, shareReplay} from 'rxjs';
import { map, timeout, retry, switchMap, catchError } from 'rxjs/operators';
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

  getForecast(loc: String, lat: number, lon: number): Observable<any> {
    if (isPlatformServer(this.platformId)) {
        return of(null);
    }

    // Return the cached stream if it already exists
    if (this.forecastCache$) {
      return this.forecastCache$;
    }

    this.forecastCache$ = this.http.get<any>(`${this.apiUrl}/gridpoints/${loc}/${lat},${lon}/forecast`).pipe(
      timeout(this.timeoutValueMs),
      retry(this.retryCount),
      switchMap(response => forkJoin({
          forecast: this.http.get<any>(`${this.apiUrl}/gridpoints/${loc}/33,70/forecast`),
          gridpoints: this.http.get<any>(`${this.apiUrl}/gridpoints/${loc}/33,70/forecast`)
        }).pipe(
          map(response => ({
            period1: response.forecast.properties.periods.find((p: any) => p.number === 1),
            gridpoints: response.gridpoints.properties
          })),
          shareReplay(1) // buffer the latest emission for all future subscribers
        )),
      catchError(err => {
        console.error('WeatherService error:', err);
        return of(null);
      })
    );

    return this.forecastCache$;
  }

  // force a fresh data fetch
  clearCache(): void {
    this.forecastCache$ = undefined;
  }

}
