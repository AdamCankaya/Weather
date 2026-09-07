import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of, shareReplay} from 'rxjs';
import { map, timeout, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = environment.weatherApiUrl;
  private timeoutValueMs = environment.timeoutThresholdMs;
  private retryCount = environment.retryCount;
  private platformId = inject(PLATFORM_ID);
  private forecast$?: Observable<any>;

  constructor() {
  }

  getForecast(loc: string, lat: number, lon: number): Observable<any> {
    // check if SSR is ongoing
    if (isPlatformServer(this.platformId)) {
      return of(null);
    }

    // fire an http request with the given coordinates, timeout and retry count
    this.forecast$ = this.http.get<any>(`${this.apiUrl}/gridpoints/${loc}/${lat},${lon}/forecast`).pipe(
      map(response => ({
        // period 1 is the next hour forecast
        period1: response?.properties?.periods?.find((p: any) => p.number === 1),
        gridpoints: response?.properties
      }))
    );

    return this.forecast$;
  }

}
