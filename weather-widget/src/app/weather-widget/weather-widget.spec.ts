import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherWidget } from './weather-widget';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { environment } from '../../environments/environment';

describe('WeatherWidget', () => {
  let component: WeatherWidget;
  let fixture: ComponentFixture<WeatherWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherWidget],
      providers: [provideZonelessChangeDetection()]
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
    expect(tempElement.textContent).toContain(`${component.temperature}°F`);
  });

  it('should update temperature and timestamp when refreshWeather is called', async () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const initialDate = component.lastUpdated;

    component.refreshWeather();
    await fixture.whenStable();

    expect(component.lastUpdated.getTime()).toBeGreaterThanOrEqual(initialDate.getTime());
    // Since temperature is randomized (70-79) just check if within range
    expect(component.temperature).toBeGreaterThanOrEqual(70);
    expect(component.temperature).toBeLessThanOrEqual(80);
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

  it('should call refreshWeather when the button is clicked', () => {
    fixture = TestBed.createComponent(WeatherWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(component, 'refreshWeather');
    const button = fixture.debugElement.query(By.css('.refresh-btn')).nativeElement;
    button.click();
    expect(component.refreshWeather).toHaveBeenCalled();
  });
});
