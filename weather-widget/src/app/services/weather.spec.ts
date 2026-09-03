import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { WeatherService } from './weather';

describe('WeatherService', () => {
  let service: WeatherService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(withFetch()), provideHttpClientTesting()]
    });
    service = TestBed.inject(WeatherService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch forecast data', () => {
      service.getForecast('MLB', 28.3228, -81.2825).subscribe(data => {
          expect(data).toBeTruthy();
          expect(data.period1.temperature).toBe(80);
      });

      const req1 = httpTestingController.expectOne('https://api.weather.gov/gridpoints/MLB/28.3228,-81.2825/forecast');
      req1.flush({});

      const reqs = httpTestingController.match('https://api.weather.gov/gridpoints/MLB/33,70/forecast');
      expect(reqs.length).toBe(2);
      reqs[0].flush({ properties: { periods: [{ number: 1, temperature: 80 }] } });
      reqs[1].flush({ properties: { relativeHumidity: { values: [] } } });
  });
});
