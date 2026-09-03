import {Component, inject, OnInit, effect, signal} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment';
import {MatIcon} from '@angular/material/icon';
import {DatePipe} from '@angular/common';
import {WeatherService} from '../services/weather';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIcon,
    DatePipe
  ],
  templateUrl: './weather-widget.html',
  styleUrl: './weather-widget.scss',
})
export class WeatherWidget implements OnInit {
  env = environment;
  locationName = 'Melbourne, FL (MLB)';
  lastUpdated = new Date();
  dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  temperature: string | null = null;
  conditionSummary: string | null = null;
  periodName: string | null = null;
  weatherIcon = 'wb_cloudy'; // default Material Icon name
  showIcon = false;
  loading = signal(true);

  private weatherService = inject(WeatherService);

  // Pass geographic coordinates and map to a signal
  readonly forecast = signal<any | null>(null);

  constructor() {
    this.refreshForecast();
    effect(() => {
      const data = this.forecast();
      if (data) {
        this.processForecast(data);
        this.loading.set(false);
      }
    });
  }

  refreshForecast(): void {
    this.loading.set(true);
    this.weatherService.clearCache();
    this.weatherService.getForecast('MLB', 33, 70).subscribe(data => {
        this.forecast.set(data);
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private processForecast(data: any): void {
      if (!data || !data.period1) return;

      // Temperature from period 1 (convert to Celsius)
      this.temperature = this.convertToC(data.period1.temperature);

      // Period Name
      this.periodName = data.period1.name;

      // Condition Summary from period 1
      this.conditionSummary = data.period1.shortForecast;
      this.updateWeatherIcon(this.conditionSummary);
  }

  private updateWeatherIcon(summary: string | null): void {
      if (!summary) return;
      const summaryLower = summary.toLowerCase();
      if (summaryLower.includes('sunny') || summaryLower.includes('clear')) {
          this.weatherIcon = 'wb_sunny';
      } else if (summaryLower.includes('cloud')) {
          this.weatherIcon = 'wb_cloudy';
      } else if (summaryLower.includes('thunderstorm')) {
          this.weatherIcon = 'thunderstorm';
      } else if (summaryLower.includes('rain') || summaryLower.includes('shower')) {
          this.weatherIcon = 'rainy';
      } else { // default
          this.weatherIcon = 'wb_cloudy';
      }
  }

  toggleIcon(): void {
    this.showIcon = !this.showIcon;
  }

  private convertToC(fahrenheit: number): string {
    return ((fahrenheit - 32) * 5 / 9).toFixed(1);
  }

  loadInitialData(): void {
    console.log('Data fetching initialized.');
  }
}
