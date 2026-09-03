export const environment = {
  production: true,
  weatherApiUrl: 'https://api.weather.gov',
  timeoutThresholdMs: 3000, // Stricter timeouts for production environments
  pollingIntervalMs: 60000
};
