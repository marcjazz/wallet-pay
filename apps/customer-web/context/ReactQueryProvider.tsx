'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Initialize a QueryClient
const queryClient = new QueryClient();

interface ReactQueryProviderProps {
  children: ReactNode;
}

/**
 * React Query provider to wrap the application.
 */
export const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
