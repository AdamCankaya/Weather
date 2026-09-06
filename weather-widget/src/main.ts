import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { WeatherWidget } from './app/weather-widget/weather-widget';
//import '@angular/localize/init';

// primary entry point for running application in the browser
// bootstrap using the widget root component and app config
bootstrapApplication(WeatherWidget, appConfig)
  .catch((err) => console.error(err));
