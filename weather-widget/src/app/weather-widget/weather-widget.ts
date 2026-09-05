import { Component, inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { WeatherService } from '../services/weather';

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
export class WeatherWidget {
  env = environment;
  locationName = 'Melbourne, FL (MLB)';
  lastUpdated = new Date();
  dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  showIcon = false;

  private weatherService = inject(WeatherService);
  
  private forecastResource = rxResource({
    stream: () => {
      this.weatherService.clearCache();
      return this.weatherService.getForecast('MLB', 33, 70);
    }
  });

  readonly forecast = computed(() => (this.forecastResource.value() as any) ?? null);
  readonly loading = computed(() => this.forecastResource.isLoading());
  readonly error = computed(() => this.forecastResource.error());

  // create state using computed signals
  // compute() takes a function and returns a read-only signal with lazy evaluation
  // period = 1 is the next hour forecast so use that
  // data comes filtered for period 1 from the service
  readonly periodData = computed(() => this.forecast()?.period1 ?? null);

  // temperature data comes in F so convert it to C
  readonly temperature = computed(() => {
    const temp = this.periodData()?.temperature;
    return temp != null ? ((temp - 32) * 5 / 9).toFixed(1) : null;
  });

  readonly periodName = computed(() => this.periodData()?.name ?? null);

  readonly conditionSummary = computed(() => this.periodData()?.shortForecast ?? null);

  readonly weatherIcon = computed(() => {
    const summary = this.conditionSummary()?.toLowerCase() ?? '';
    if (summary.includes('sunny') || summary.includes('clear')) return 'wb_sunny';
    if (summary.includes('cloud')) return 'wb_cloudy';
    if (summary.includes('thunderstorm')) return 'thunderstorm';
    if (summary.includes('rain') || summary.includes('shower')) return 'rainy';
    return 'wb_cloudy'; // default icon
  });

  constructor() {
    // rxResource automatically loads on initialization
  }

  // todo get rid of hard coded coordinates
  refreshForecast(): void {
    this.forecastResource.reload();
  }

  toggleIcon(): void {
    this.showIcon = !this.showIcon;
  }
}
