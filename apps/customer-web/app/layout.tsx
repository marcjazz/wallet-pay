export const dynamic = 'force-dynamic';

import './global.scss';
import { AppLayout } from '../components/AppLayout';
import { ReactQueryProvider } from '../context/ReactQueryProvider';
import { DM_Sans, Darker_Grotesque } from 'next/font/google';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const darkerGrotesque = Darker_Grotesque({
  subsets: ['latin'],
  variable: '--font-darker-grotesque',
});

export const metadata = {
  title: 'XAFPAY',
  description:
    'The best way to send money to your loved ones from the US to Cameroon',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${darkerGrotesque.variable}`}>
        <ReactQueryProvider>
          <ErrorBoundary
            fallback={<p>An error occurred</p>}
            onError={Sentry.captureException}
          >
            <AppLayout>{children}</AppLayout>
          </ErrorBoundary>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
