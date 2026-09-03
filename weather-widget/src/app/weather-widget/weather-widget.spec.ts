import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherWidget } from './weather-widget';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { WeatherService } from '../services/weather';
import { of } from 'rxjs';

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

  it('should display the correct location name', () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const locationElement = fixture.debugElement.query(By.css('.location-container h2')).nativeElement;
    expect(locationElement.textContent).toContain(component.locationName);
  });

  it('should display the temperature', () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const tempElement = fixture.debugElement.query(By.css('.temperature')).nativeElement;
    expect(tempElement.textContent).toContain(`${component.temperature}°C`);
  });

  it('should display period name', () => {
    mockWeatherService.getForecast.and.returnValue(of({
        period1: { temperature: 80, shortForecast: 'Sunny', name: 'This afternoon' }
    }));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const periodNameElement = fixture.debugElement.query(By.css('.period-name')).nativeElement;
    expect(periodNameElement.textContent).toBe('This afternoon');
  });

  it('should toggle icon visibility', async () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
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

  it('should display day of week', () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const dayElement = fixture.debugElement.query(By.css('.day-of-week')).nativeElement;
    expect(dayElement.textContent).toBe(component.dayOfWeek);
  });

  it('should update weather icon based on forecast', () => {
    mockWeatherService.getForecast.and.returnValue(of({
        period1: { temperature: 80, shortForecast: 'Thunderstorms', name: 'Afternoon' }
    }));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.weatherIcon).toBe('thunderstorm');
  });

  it('should convert 91F to 32.8C', () => {
    mockWeatherService.getForecast.and.returnValue(of({
        period1: { temperature: 91, shortForecast: 'Sunny', name: 'Morning' }
    }));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const tempElement = fixture.debugElement.query(By.css('.temperature')).nativeElement;
    expect(tempElement.textContent).toBe('32.8°C');
  });

  it('should convert 88F to 31.1C', () => {
    mockWeatherService.getForecast.and.returnValue(of({
        period1: { temperature: 88, shortForecast: 'Sunny', name: 'Morning' }
    }));
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
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
    mockWeatherService.getForecast.and.returnValue(of({ errorActive: true }));
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
});
