'use client';
import { responsiveFontSizes, ThemeProvider } from '@mui/material';
import { FC, PropsWithChildren } from 'react';
import { useTheme } from './theme';

export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider
      theme={responsiveFontSizes(useTheme(), {
        factor: 50,
        breakpoints: ['mobile', 'tablet', 'laptop', 'desktop'],
      })}
    >
      {children}
    </ThemeProvider>
  );
};
