'use client';
import { XafpayThemeProvider } from '@xafpay/theme';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import SplashScreen from './layout/SplashScreen';

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const [isSplashScreenVisible, setIsSplashScreenVisible] =
    useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setIsSplashScreenVisible(false);
    }, 3000);
  }, []);

  return isSplashScreenVisible ? (
    <SplashScreen />
  ) : (
    <XafpayThemeProvider>{children}</XafpayThemeProvider>
  );
};
