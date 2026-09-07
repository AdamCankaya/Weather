# Angular MLB Weather Widget
The Angular MLB Weather Widget is a production-ready Single Page Application (SPA) designed to display 
 real-time weather data fetched directly from the National Weather Service (NWS) API. This widget is designed for 
 high performance, using reactive state management and resilient network failure handling. Tested for both Edge and 
 Chrome browsers.


## Architecture Decisions
* Built with Angular 20, the project aims to deliver a high-performance experience by with work being completed on the 
 client side, leveraging the NWS API's permissive CORS policies to eliminate the need for a backend server.

* We chose rxResource in conjunction with Angular Signals to effectively manage the asynchronous nature of the data
 fetching lifecycle. Unlike traditional approaches that require complex RxJS piping, rxResource provides native,
 declarative binding of isLoading, value, and error states into a single reactive object.

* We implement RxJS shareReplay(1) to handle multicasting. It caches the latest emitted value from the observable so 
 that multiple subscribers can share the data without triggering redundant network traffic and memory is garbage 
 collected when user navigates away from component.


## Reactive State Management
* Angular rxResource combined with Signals to manage the asynchronous data lifecycle.

* This simplifies state management significantly by keeping the UI automatically synchronized with the data fetching
 process without requiring manual subscriptions. This allows declarative control flow using Angular’s @if / @else 
 syntax, which allows the application to transition seamlessly between loading, active data, and offline states based 
 solely on derived signal states. 

* This not only results in cleaner, more maintainable code but also enhances the application's overall resilience, 
 ensuring a consistent user experience even when network interruptions occur.

* Automatic State Tracking: rxResource natively binds the isLoading, value, and error states into a single reactive 
 object, eliminating the need for complex catchError RxJS pipes or subscriptions.

* Declarative Control Flow: Utilize Angular's @if / @else if syntax to nicely transition between loading spinner, 
 active weather data, and offline fallback, based only on the derived signal state.


## Offline Resilience & Asset Bundling
* To ensure a good user experience during network interruptions, the widget implements a dedicated offline default state

* Standalone Offline UI: When rxResource detects a network failure, the application swaps the standard layout for an 
 offline card to prevent broken or missing data fields.

* Locally Bundled Typography: Google Material Icons are bundled directly into the application's build configuration 
 (angular.json) to ensure that icon gr[README.md](weather-widget/README.md)aphics still can render when the browser has a network failure.


## Build and deploy instructions
- **npm install**
- ng test
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
* development (default) - longer network timeout value, different UI theme
* production - shorter network timeout value, original UI theme


## Future tasks 
- Display weather based on user location
- Expand weather data beyond next hour forecast
- Implement localization (units, time format) and internationalization (language) for weather data
- Implement Vitest for unit testing 
- Look at API always returning 200 OK status code
- Measure Core Web Vitals (load time, page responsiveness, visual stability)