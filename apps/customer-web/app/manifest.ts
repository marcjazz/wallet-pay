export default function manifest() {
  return {
    name: 'XafPay Wallet App',
    short_name: 'XafPay Wallet',
    description:
      'XafPay Wallet App\n\nMaximise the value of your remittances to Cameroon with our exceptional exchange rates.',
    categories: ['finance', 'business'],
    icons: [
      {
        src: '/assets/pwa_logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/assets/pwa_logo_512.png',
        sizes: '512x512',
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
        form_factor: 'narrow',
      },
      {
        src: '/assets/screenshots/transfer_1.png',
        sizes: '430x932',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/assets/screenshots/transfer_2.png',
        sizes: '430x932',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/assets/screenshots/transfer_summary_1.png',
        sizes: '430x932',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/assets/screenshots/transfer_summary_2.png',
        sizes: '430x932',
        type: 'image/png',
        form_factor: 'narrow',
      },
      {
        src: '/assets/screenshots/transfer_summary_wide.png',
        sizes: '1083x870',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
    theme_color: '#157cfb',
    background_color: '#FFFFFF',
    start_url: '/?source=xafpay',
    display: 'standalone',
    orientation: 'portrait',
    id: 'xafpay-wallet-app',
    dir: 'ltr',
    scope: '/',
    lang: 'en-US',
    related_applications: [
      {
        platform: 'webapp',
        url: 'https://app.xafpay.com/manifest.json',
      },
    ],
    edge_side_panel: {
      preferred_width: 480,
    },
    handle_links: 'preferred',
    launch_handler: {
      client_mode: ['navigate-existing'],
    },
  };
}
