import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
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

  constructor() {
  }

  getForecast(loc: String, lat: number, lon: number): Observable<any> {
    if (isPlatformServer(this.platformId)) {
        return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/gridpoints/${loc}/${lat},${lon}/forecast`).pipe(
      timeout(this.timeoutValueMs),
      retry(this.retryCount),
      switchMap(response => forkJoin({
          forecast: this.http.get<any>(`${this.apiUrl}/gridpoints/${loc}/33,70/forecast`),
          gridpoints: this.http.get<any>(`${this.apiUrl}/gridpoints/${loc}/33,70/forecast`)
        }).pipe(
          map(response => ({
            period1: response.forecast.properties.periods.find((p: any) => p.number === 1),
            gridpoints: response.gridpoints.properties
          }))
        )),
      catchError(err => {
        console.error('WeatherService error:', err);
        return of(null);
      })
    );
  }
}
