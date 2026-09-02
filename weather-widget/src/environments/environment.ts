export const environment = {
  production: true,
  weatherApiUrl: 'https://api.weather.gov/gridpoints/MLB/33,70/forecast',
  timeoutThresholdMs: 3000, // Stricter timeouts for production environments
  pollingIntervalMs: 60000
};
