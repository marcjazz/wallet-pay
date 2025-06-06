import { AppLayout } from '../components/AppLayout';
import '../../public/styles/global.css';
import '../../public/styles/reset.css';
import '../../public/styles/style.scss';


export const metadata = {
  title: 'Xafpay Portal',
  description: 'Take a look how xafpay aims to revolutionize the payment industry and register.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div>
          <AppLayout>
            {children}
          </AppLayout>
        </div>
      </body>
    </html>
  );
}
