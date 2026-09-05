# Angular MLB Weather Widget

A production-ready Single Page Application (SPA) built with Angular 20 that displays real-time weather data from the 
National Weather Service (NWS) API. This widget is designed for high performance, using reactive state management and 
resilient network failure handling. Tested for both Edge and Chrome browsers.

## Architecture Decisions
* All work to be completed on the client side - no backend server such as Java required. 

* Utilize Angular's native HttpClient to communicate directly with public web API endpoint (api.weather.gov).

* This is possible because the NWS servers provide permissive Cross-Origin Resource Sharing (CORS) headers to allow the 
browser to securely request and process JSON payloads directly within the client environment. We rely on the browser to 
execute the API calls and render the DOM.

* RxJS shareReplay & Multicasting: implement RxJS shareReplay(1) to handle multicasting. Caches the latest emitted value
from the observable so that multiple subscribers can share the data without triggering redundant network traffic and 
memory is garbage collected when user navigates away from component.


## Reactive State Management
* Angular rxResource combined with Signals to manage the asynchronous data lifecycle.

* Automatic State Tracking: rxResource natively binds the isLoading, value, and error states into a single reactive 
object, eliminating the need for complex catchError RxJS pipes or subscriptions.

* Declarative Control Flow: Utilize Angular's @if / @else if syntax to nicely transition between loading spinner, 
active weather data, and offline fallback, based only on the derived signal state.


## Offline Resilience & Asset Bundling
* To ensure a good user experience during network interruptions, the widget implements a dedicated offline default state

* Standalone Offline UI: When rxResource detects a network failure, the application swaps the standard layout for an 
offline card to prevent broken or missing data fields.

* Locally Bundled Typography: Google Material Icons are bundled directly into the application's build configuration 
(angular.json) to ensure that critical vector graphics still can render when the browser has a network failure.


## Build and deploy instructions
- npm install
- ng build
- ng build --configuration production
- npx http-server dist/weather-widget/browser -p 4200
- ng serve
- ng serve --configuration=production
- https://localhost:4200

## Environments