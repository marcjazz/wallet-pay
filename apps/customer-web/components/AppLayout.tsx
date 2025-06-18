'use client';

import { XafpayThemeProvider } from '@xafpay/theme';
import { usePathname, useRouter } from 'next/navigation';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { API_BASE_URL } from '../api/constants';
import { ApiClient } from '../api/services/ApiClient';
import SplashScreen from './layout/SplashScreen';

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const [isSplashScreenVisible, setIsSplashScreenVisible] =
    useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setIsSplashScreenVisible(false);

      const apiClient = ApiClient.getInstance(API_BASE_URL);
      if (!apiClient.getAuthToken()) {
        if (pathname === '/register' ||
          pathname === '/login') {
          return;
        }
        localStorage.setItem('redirectPath', pathname);
        push('/login');
      }
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pathname = usePathname();
  const { push } = useRouter();

  return isSplashScreenVisible ? (
    <SplashScreen />
  ) : (
    <XafpayThemeProvider>{children}</XafpayThemeProvider>
  );
};
