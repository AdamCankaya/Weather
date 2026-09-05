import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { WeatherWidget } from '../weather-widget/weather-widget';
import { WeatherService } from './weather';
import { from } from 'rxjs';

describe('WeatherService & WeatherWidget', () => {
  let component: WeatherWidget;
  let fixture: ComponentFixture<WeatherWidget>;
  let service: WeatherService;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherWidget],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    service = TestBed.inject(WeatherService);
    httpTestingController = TestBed.inject(HttpTestingController);

    // Flush the single initial request triggered on component creation
    const req = httpTestingController.expectOne('https://api.weather.gov/gridpoints/MLB/33,70/forecast');
    req.flush({ properties: { periods: [{ number: 1, temperature: 75, name: 'Today', shortForecast: 'Sunny' }] } });

    fixture.detectChanges();
  });

  // verify only expected network calls
  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle the showIcon property', () => {
    expect(component.showIcon).toBeFalse();

    component.toggleIcon();
    expect(component.showIcon).toBeTrue();

    component.toggleIcon();
    expect(component.showIcon).toBeFalse();
  });

  it('should correctly convert Fahrenheit to Celsius', () => {
    // Set the forecast signal directly to test the computed temperature conversion
    component.forecast.set({
      period1: {
        name: 'Today',
        shortForecast: 'Sunny',
        temperature: 50 // 50F should perfectly equal 10.0C
      }
    });

    expect(component.temperature()).toBe('10.0');
  });

  it('should map specific weather conditions to the correct Material Icon', () => {
    component.forecast.set({ period1: { shortForecast: 'Mostly Sunny' } });
    expect(component.weatherIcon()).toBe('wb_sunny');

    component.forecast.set({ period1: { shortForecast: 'Chance of Rain Showers' } });
    expect(component.weatherIcon()).toBe('rainy');

    component.forecast.set({ period1: { shortForecast: 'Severe Thunderstorms' } });
    expect(component.weatherIcon()).toBe('thunderstorm');

    component.forecast.set({ period1: { shortForecast: 'Windy and overcast' } });
    expect(component.weatherIcon()).toBe('wb_cloudy');
  });

  // spy on service and use asyncScheduler to defer emission so loading state can be asserted
  it('should clear cache, set loading state, and fetch new data on refresh', async () => {
    const mockResponse = {
      period1: { temperature: 75, name: 'Tonight', shortForecast: 'Clear' },
      gridpoints: {}
    };

    // Return an observable backed by a Promise to defer execution
    const getForecastSpy = spyOn(component['weatherService'], 'getForecast')
      .and.returnValue(from(Promise.resolve(mockResponse)));

    const clearCacheSpy = spyOn(component['weatherService'], 'clearCache');

    component.refreshForecast();

    // Verify that cache clearing was requested and API was called
    expect(component.loading()).toBeTrue();
    expect(clearCacheSpy).toHaveBeenCalled();
    expect(getForecastSpy).toHaveBeenCalledWith('MLB', 33, 70);

    await fixture.whenStable();

    // Verify final states after the response data populates and loading finishes
    expect(component.forecast()).toEqual(mockResponse);
    expect(component.loading()).toBeFalse();
  });

  it('should fetch forecast data with a single HTTP call', () => {
    // Clear cache to force a new request
    service.clearCache();

    // 1. Call the service directly with grid coordinates
    service.getForecast('MLB', 33, 70).subscribe(data => {
      expect(data).toBeTruthy();
      expect(data.period1.temperature).toEqual(jasmine.any(Number));
    });

    // 2. Expect exactly one request and verify it's a GET
    const req = httpTestingController.expectOne('https://api.weather.gov/gridpoints/MLB/33,70/forecast');
    expect(req.request.method).toBe('GET');

    // 3. Flush the single mock response
    req.flush({
      properties: {
        periods: [
          {
            number: 1,
            temperature: 75,
            name: 'Today',
            shortForecast: 'Sunny'
          }
        ]
      }
    });
  });
});
