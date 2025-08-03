import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'XafPay Wallet App',
    short_name: 'XafPay Wallet',
    icons: [
      {
        src: '/assets/pwa_logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/assets/pwa_logo.svg',
        sizes: '192x241',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    screenshots: [
        {
            src: '/assets/screenshots/home_screen.png',
            sizes: '430x932',
            type: 'image/png',
        },
        {
            src: '/assets/screenshots/transfert_1.png',
            sizes: '430x932',
            type: 'image/png',
        },
        {
            src: '/assets/screenshots/transfert_2.png',
            sizes: '430x932',
            type: 'image/png',
        },
        {
            src: '/assets/screenshots/transfert_summary_1.png',
            sizes: '430x932',
            type: 'image/png',
        },
        {
            src: '/assets/screenshots/transfert_summary_2.png',
            sizes: '430x932',
            type: 'image/png',
        },
    ],
    theme_color: '#157cfb',
    background_color: '#1E40AF',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
  };
}
