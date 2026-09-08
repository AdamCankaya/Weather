# Angular MLB Weather Widget
The Angular MLB Weather Widget is a production-ready Single Page Application (SPA) designed to display 
 real-time weather data fetched directly from the National Weather Service (NWS) API. This widget is designed for 
 high performance, using reactive state management and resilient network failure handling. Tested for both Edge and 
 Chrome browsers.

## Initial Questions
- Device type / resolution scaling
- Part of a larger Angular app?
- Network connectivity/stability?
- Data volatility?
- Number of concurrent users?
- Angular version?
- Localization?
- SEO?

## Architecture Decisions for Reactive State Management
* Built with Angular 20, the project aims to deliver a high-performance experience with work being completed on the 
 client side, leveraging the NWS API's permissive CORS policies to eliminate the need for a backend server.

* SSR (Server-Side Rendering) is not used yet, but is supported by the project for future implementation.

* Use rxResource in conjunction with Angular Signals to effectively manage the asynchronous nature of the data
 fetching lifecycle. This simplifies state management significantly by keeping the UI automatically synchronized with 
 the data fetching process without requiring manual subscriptions and allows declarative control flow using Angular’s 
 @if / @else syntax, which allows seemless transitions between loading spinner, active data, and offline fallback.

* Automatic State Tracking: rxResource natively binds the isLoading, value, and error states into a single reactive 
 object, eliminating the need for complex catchError RxJS pipes or subscriptions.

* We also implement RxJS shareReplay(1) to handle multicasting. It caches the latest emitted value from the observable so
  that multiple subscribers can share the data without triggering redundant network traffic while memory is garbage
  collected when the user navigates away from the component.


## Offline Resilience & Asset Bundling
* To ensure a good user experience during network interruptions, the widget implements a dedicated offline default state

* Standalone Offline UI: When rxResource detects a network failure, the application swaps the standard layout for an 
 offline card to prevent broken or missing data fields.

* Locally Bundled Typography: Google Material Icons are bundled directly into the application's build configuration 
 (angular.json) to ensure that icon graphics still can render when the browser has a network failure.


## Build and deploy instructions
- **npm install**
- ng test
- ng lint
- ng lint -fix
- **ng build**
- ng build --configuration production (build for production environment)
- ng build --localize (build with localization)
- ng build --configuration=es-build (build only Spanish)
- ng extract-i18n (build the i18n message files)
- npx http-server dist/weather-widget/browser -p 4200 (serves dist files)
- **ng serve**
- ng serve --configuration=production (serve production environment)
- ng serve --configuration=es (serve in Spanish)
- https://localhost:4200


## Environments
* development (default) - longer timeout values, different UI theme
* production - shorter timeout values, original UI theme


## Future tasks 
- Display weather based on user location
- Expand weather data beyond next hour forecast
- Implement localization (units, time format) and internationalization (language) for weather data
- Implement Vitest for unit testing 
- Look at API always returning 200 OK status code
- Measure Core Web Vitals (load time, page responsiveness, visual stability) for SEO
- Fix lint and prettier issues