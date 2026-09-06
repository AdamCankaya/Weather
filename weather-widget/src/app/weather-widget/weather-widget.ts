import {Component, inject, computed, PLATFORM_ID, DestroyRef, signal} from '@angular/core';
import {rxResource, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment';
import { MatIcon } from '@angular/material/icon';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { WeatherService } from '../services/weather';
import {interval, startWith} from 'rxjs';

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
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  private pollTrigger = signal(0);

  env = environment;
  locationName = 'Melbourne, FL (MLB)';
  lastUpdated = computed(() => this.forecast.value()?.timestamp ?? new Date());
  dayOfWeek = computed(() => this.lastUpdated().toLocaleDateString('en-US', { weekday: 'long' }));
  showIcon = false;

  private weatherService = inject(WeatherService);

  private forecastResource = rxResource({
    stream: () => {
      this.weatherService.clearCache();
      return this.weatherService.getForecast('MLB', 33, 70);
    }
  });

  readonly forecast = rxResource({
    params: () => ({ tick: this.pollTrigger() }),
    stream: ({ params }) => this.weatherService.getForecast( 'MLB', 33, 70 )
  });

  readonly loading = computed(() => this.forecastResource.isLoading());
  readonly error = computed(() => this.forecastResource.error());

  // create state using computed signals
  // compute() takes a function and returns a read-only signal with lazy evaluation
  // period = 1 is the next hour forecast so use that
  // data comes filtered for period 1 from the service
  readonly periodData = computed(() => this.forecast.value()?.period1 ?? null);

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
    if (isPlatformBrowser(this.platformId)) {
      interval(300000)  // update weather data every 5 minutes
        .pipe(
          startWith(0),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => {
          // console.log('updating weather data...')
          // Incrementing the signal forces rxResource to re-fetch
          this.pollTrigger.update(val => val + 1);
        });
    }
  }

  refreshForecast(): void {
    if (isPlatformBrowser(this.platformId)) { // render on the client only
        this.forecastResource.reload();
    } else {
        console.log('Rendering on the server');
    }
  }

  toggleIcon(): void {
    this.showIcon = !this.showIcon;
  }
}
