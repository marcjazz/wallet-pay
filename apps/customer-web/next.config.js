//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const { withSentryConfig } = require('@sentry/nextjs');

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
  output: 'standalone',
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.xafpay.com/api/:path*',
      },
    ];
  },
  productionBrowserSourceMaps: true,
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
            value: [
              "default-src 'self' https://app.xafpay.com",
              "connect-src 'self' https://api.xafpay.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.plaid.com",
              "font-src 'self' https://fonts.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "script-src 'self' 'unsafe-inline' https://cdn.plaid.com",
              "img-src 'self' data: https://cdn.plaid.com",
            ].join('; '),
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

const withSerwist = require('@serwist/next').default({
  // Note: This is only an example. If you use Pages Router,
  // use something else that works, such as "service-worker/index.ts".
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
});
const serwistWrappedConfig = withSerwist(nextConfig);

let nextConfigFn;
if (process.env.NODE_ENV === 'production') {
  const sentryWrappedConfig = withSentryConfig(serwistWrappedConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    // Pass the auth token
    authToken: process.env.SENTRY_AUTH_TOKEN,
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: false,
    tunnelRoute: true,
    silent: true,
  });

  nextConfigFn = composePlugins(...plugins)(sentryWrappedConfig);
} else nextConfigFn = composePlugins(...plugins)(serwistWrappedConfig);

module.exports = nextConfigFn;
