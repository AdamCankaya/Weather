import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherWidget } from './weather-widget/weather-widget';
import {MatToolbar} from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WeatherWidget, MatToolbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('weather-widget');
}
