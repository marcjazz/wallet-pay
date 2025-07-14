export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
    console.warn(
      'Sentry server configuration loaded. Ensure that your DSN and other settings are correct.'
    );
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
    console.warn(
      'Sentry server configuration loaded. Ensure that your DSN and other settings are correct.'
    );
  }
}
