import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://YOUR_SENTRY_DSN', // Replace with your own DSN from Sentry.io
  tracesSampleRate: 1.0, // Adjust the rate of performance monitoring
  sendDefaultPii: true, // Send personally identifiable information
});