import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import { WeatherWidget } from './weather-widget';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { WeatherService } from '../services/weather';
import {of, Subject, throwError} from 'rxjs';

describe('WeatherWidget', () => {
  let component: WeatherWidget;
  let fixture: ComponentFixture<WeatherWidget>;
  let mockWeatherService: jasmine.SpyObj<WeatherService>;

  beforeEach(async () => {
    mockWeatherService = jasmine.createSpyObj('WeatherService', ['getForecast', 'clearCache']);
    mockWeatherService.getForecast.and.returnValue(of({
        period1: { temperature: 80, shortForecast: 'Sunny', name: 'Morning' },
        gridpoints: {}
    }));

    await TestBed.configureTestingModule({
      imports: [WeatherWidget],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withFetch()),
        { provide: WeatherService, useValue: mockWeatherService }
      ]
    })
    .compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the correct location name', async () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const locationElement = fixture.debugElement.query(By.css('.location-container h2')).nativeElement;
    expect(locationElement.textContent).toContain(component.locationName);
  });

  it('should display the temperature', async () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const tempElement = fixture.debugElement.query(By.css('.temperature')).nativeElement;
    expect(tempElement.textContent).toContain(`${component.temperature()}°C`);
  });

  it('should display period name', async () => {
    mockWeatherService.getForecast.and.returnValue(of({
        period1: { temperature: 80, shortForecast: 'Sunny', name: 'This afternoon' }
    }));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const periodNameElement = fixture.debugElement.query(By.css('.period-name')).nativeElement;
    expect(periodNameElement.textContent).toBe('This afternoon');
  });

  it('should toggle icon visibility', async () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.showIcon).toBeFalse();
    expect(fixture.debugElement.query(By.css('.weather-main-icon'))).toBeNull();

    const toggleBtn = fixture.debugElement.query(By.css('.toggle-icon-btn'));
    toggleBtn.nativeElement.click();
    fixture.detectChanges();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.showIcon).toBeTrue();
    expect(fixture.debugElement.query(By.css('.weather-main-icon'))).toBeTruthy();
  });

  it('should display day of week', async () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const dayElement = fixture.debugElement.query(By.css('.day-of-week')).nativeElement;
    expect(dayElement.textContent).toBe(component.dayOfWeek);
  });

  it('should update weather icon based on forecast', async () => {
    mockWeatherService.getForecast.and.returnValue(of({
        period1: { temperature: 80, shortForecast: 'Thunderstorms', name: 'Afternoon' }
    }));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.weatherIcon()).toBe('thunderstorm');
  });

  it('should convert 91F to 32.8C', async () => {
    mockWeatherService.getForecast.and.returnValue(of({
        period1: { temperature: 91, shortForecast: 'Sunny', name: 'Morning' }
    }));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const tempElement = fixture.debugElement.query(By.css('.temperature')).nativeElement;
    expect(tempElement.textContent).toBe('32.8°C');
  });

  it('should convert 88F to 31.1C', async () => {
    mockWeatherService.getForecast.and.returnValue(of({
        period1: { temperature: 88, shortForecast: 'Sunny', name: 'Morning' }
    }));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const tempElement = fixture.debugElement.query(By.css('.temperature')).nativeElement;
    expect(tempElement.textContent).toBe('31.1°C');
  });

  describe('Environment specifics', () => {
    it('should apply "production" class when environment.production is true', async () => {
      fixture = TestBed.createComponent(WeatherWidget);
      component = fixture.componentInstance;
      component.env = { ...environment, production: true };
      fixture.detectChanges();
      await fixture.whenStable();
      const rootElement = fixture.debugElement.query(By.css('.trading-card')).nativeElement;
      expect(rootElement.classList.contains('production')).toBeTrue();
    });

    it('should NOT apply "production" class when environment.production is false', async () => {
      fixture = TestBed.createComponent(WeatherWidget);
      component = fixture.componentInstance;
      component.env = { ...environment, production: false };
      fixture.detectChanges();
      await fixture.whenStable();
      const rootElement = fixture.debugElement.query(By.css('.trading-card')).nativeElement;
      expect(rootElement.classList.contains('production')).toBeFalse();
    });
  });

  it('should call clearCache and getForecast when Refresh button is clicked', async () => {
    mockWeatherService.getForecast.and.returnValue(throwError(() => new Error('Network error')));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const refreshBtn = fixture.debugElement.query(By.css('.offline-container button'));
    expect(refreshBtn).toBeTruthy();

    refreshBtn.nativeElement.click();
    fixture.detectChanges();

    expect(mockWeatherService.clearCache).toHaveBeenCalled();
    expect(mockWeatherService.getForecast).toHaveBeenCalledTimes(2);
  });

  it('should apply assertive aria-live and alert role on network error', async () => {
    mockWeatherService.getForecast.and.returnValue(throwError(() => new Error('Network error')));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const errorBanner = fixture.nativeElement.querySelector('.offline-container');

    // Verify the error banner interrupts the screen reader
    expect(errorBanner).toBeTruthy();
    expect(errorBanner.getAttribute('role')).toBe('alert');
    expect(errorBanner.getAttribute('aria-live')).toBe('assertive');
  });

  it('should apply polite aria-live and status role during loading', async () => {
    // 1. Get a reference to the mocked service
    const weatherService = TestBed.inject(WeatherService) as jasmine.SpyObj<WeatherService>;

    // 2. Return a pending Subject so the request never completes, trapping it in the loading state
    const pendingRequest = new Subject<any>();
    weatherService.getForecast.and.returnValue(pendingRequest.asObservable());

    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;

    // 3. Trigger initial component render
    fixture.detectChanges();

    // 4. Use a native Promise to yield the JavaScript event loop for 10ms.
    // This allows the rxResource's internal timer(0) to execute without needing fakeAsync.
    await new Promise(resolve => setTimeout(resolve, 10));

    // 5. Trigger change detection again to render the updated HTML
    fixture.detectChanges();

    const loadingContainer = fixture.nativeElement.querySelector('.loading-placeholder');

    // 6. Assertions
    expect(loadingContainer).withContext('Loading placeholder was not found in the DOM').toBeTruthy();
    expect(loadingContainer.getAttribute('role')).toBe('status');
    expect(loadingContainer.getAttribute('aria-live')).toBe('polite');
  });

  it('should hide decorative icons from screen readers', async () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // Query a decorative icon, such as the location pin
    const locationIcon = fixture.nativeElement.querySelector('.location-icon');

    expect(locationIcon).toBeTruthy();
    expect(locationIcon.getAttribute('aria-hidden')).toBe('true');
  });
});
