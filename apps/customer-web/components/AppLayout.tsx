'use client';

import { XafpayThemeProvider } from '@xafpay/theme';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, PropsWithChildren, useEffect } from 'react';
import { API_BASE_URL } from '../api/constants';
import { ApiClient } from '../api/services/ApiClient';

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { push } = useRouter();
  // Retrieve the ApiClient singleton instance once
  const apiClient = ApiClient.getInstance(API_BASE_URL);

  useEffect(() => {
    setTimeout(() => {

      if (!apiClient.getAuthToken()) {
        if (pathname === '/register' || pathname === '/login') return;

        const fullUrl = `${pathname}${
          searchParams.toString() ? `?${searchParams.toString()}` : ''
        }`;

        if (typeof window !== 'undefined') {
          localStorage.setItem('redirectPath', fullUrl);
        }
        push('/login');
      }
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <XafpayThemeProvider>{children}</XafpayThemeProvider>
  );
};
