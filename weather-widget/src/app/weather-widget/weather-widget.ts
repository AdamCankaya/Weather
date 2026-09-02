import {Component, OnInit} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../environments/environment';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/list';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [
    MatCardModule,
    MatToolbarModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIcon,
    MatDivider,
    DatePipe
  ],
  templateUrl: './weather-widget.html',
  styleUrl: './weather-widget.scss',
})
export class WeatherWidget implements OnInit {
  env = environment;
  locationName = 'Melbourne, FL (MLB)';
  lastUpdated = new Date();
  temperature = 74;
  conditionSummary = 'Partly Cloudy';
  windSpeed = 8;
  windDirection = 'ESE';
  humidity = 72;
  pressure = 1015;
  weatherIcon = 'wb_cloudy'; // Default Material Icon name

  constructor() {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    console.log('Data fetching initialized.');
  }

  refreshWeather(): void {
    console.log('Refreshing weather data...');
    // Logic to call service and update properties
    this.lastUpdated = new Date();
    // Randomize temp slightly for demo effect
    this.temperature = Math.floor(Math.random() * 10) + 70;
  }
}
