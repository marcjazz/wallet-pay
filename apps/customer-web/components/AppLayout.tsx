'use client';
import { XafpayThemeProvider } from '@xafpay/theme';
import { FC, PropsWithChildren } from 'react';

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  return <XafpayThemeProvider>{children}</XafpayThemeProvider>;
};
