import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app/app.config.server';
import {WeatherWidget} from './app/weather-widget/weather-widget';

// main entry point for SSR building
// bootstrap the application using the widget root component and app config
const bootstrap = () => bootstrapApplication(WeatherWidget, config);

export default bootstrap;
