import { AppLayout } from '../components/AppLayout';
import '../public/styles/global.scss';

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
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
