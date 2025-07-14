import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, // Replace with your own DSN from Sentry.io
  tracesSampleRate: 1.0, // Adjust the rate of performance monitoring
  sendDefaultPii: true, // Send personally identifiable information
});