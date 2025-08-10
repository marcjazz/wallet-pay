import './global.css';
export const dynamic = 'force-dynamic';

import { AppLayout } from '../components/AppLayout';
import { ReactQueryProvider } from '../context/ReactQueryProvider';
import { Viewport, type Metadata } from 'next';
import { InstallPrompt } from '../components/pwa/InstallPrompt';

const APP_NAME = 'XafPay Wallet';
const APP_DEFAULT_TITLE = 'XafPay Wallet';
const APP_TITLE_TEMPLATE = '%s - XafPay Wallet';
const APP_DESCRIPTION =
  'The best way to send money to your loved ones from the US to Cameroon';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    startupImage: [
      {
        url: '/assets/welcome_screen_img.png',
        media:
          '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  manifest: '/manifest.json',
  icons: {
    shortcut: '/favicon.ico',
    apple: [
      {
        url: '/assets/pwa-logo.svg',
        sizes: '192x241',
        type: 'image/png',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#157cfb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <InstallPrompt />
          <AppLayout>{children}</AppLayout>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
