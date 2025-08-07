//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const { withSentryConfig } = require('@sentry/nextjs');
const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  reactStrictMode: true,
  // Use standard Next.js build output with Nx
  distDir: '.next',
  webpack: (config, { isServer }) => {
    // Suppress OpenTelemetry instrumentation warnings
    config.ignoreWarnings = [
      // Ignore all critical dependency warnings from OpenTelemetry
      /Critical dependency: the request of a dependency is an expression/,
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
      // Additional patterns for OpenTelemetry warnings
      /node_modules\/@opentelemetry\/instrumentation.*Critical dependency/,
      /node_modules\/@prisma\/instrumentation.*Critical dependency/,
      /node_modules\/require-in-the-middle.*Critical dependency/,
      // Catch-all for Sentry-related OpenTelemetry warnings
      /node_modules\/@sentry\/.*@opentelemetry.*Critical dependency/,
    ];
    
    // Additional webpack configuration to handle dynamic imports
    config.module = config.module || {};
    config.module.unknownContextCritical = false;
    config.module.exprContextCritical = false;
    config.module.unknownContextRegExp = /^\.\/.*$/;
    
    return config;
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.xafpay.com/api/:path*',
      },
    ];
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

/** @type {(phase: string, defaultConfig: import("next").NextConfig) => Promise<import("next").NextConfig>} */
module.exports = async (phase) => {
  const sentryWrappedConfig = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    // Pass the auth token
    authToken: process.env.SENTRY_AUTH_TOKEN,
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
    tunnelRoute: true,
    // Suppress build output
    silent: true,
  });

  let finalConfig = composePlugins(...plugins)(sentryWrappedConfig);

  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withSerwist = (await import('@serwist/next')).default({
      // Note: This is only an example. If you use Pages Router,
      // use something else that works, such as "service-worker/index.ts".
      swSrc: 'app/sw.ts',
      swDest: 'public/sw.js',
    });
    return withSerwist(finalConfig);
  }

  return finalConfig;
};

