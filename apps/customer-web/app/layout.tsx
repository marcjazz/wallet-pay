export const dynamic = "force-dynamic";

import { AppLayout } from '../components/AppLayout';
import { ReactQueryProvider } from '../context/ReactQueryProvider';
import '../public/styles/global.scss';
import 'react-toastify/dist/ReactToastify.css';

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
      <body>
        <ReactQueryProvider>
          <AppLayout>{children}</AppLayout>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
