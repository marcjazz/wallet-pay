import { CssBaseline, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { Toaster } from 'sonner';
import LanguageContextProvider, {
  useLanguage,
} from './contexts/language/LanguageContextProvider';
import ModeContextProvider, {
  useMode,
} from './contexts/modeContext/ModeContextProvider';
import { ModeType } from './contexts/modeContext/mode.interface';
import UserContextProvider from './contexts/user/user.provider';
import enMessages from './languages/en-us';
import frMessages from './languages/fr';
import { useTheme } from './theme';

const TempApp = ({ children }: { children: React.ReactNode }) => {
  const { activeMode, modeDispatch } = useMode();
  const { activeLanguage } = useLanguage();
  const activeMessages = activeLanguage === 'En' ? enMessages : frMessages;
  // const supportedLocales: Record<LanguageType, string> = {
  //   En: 'en-US',
  //   Fr: 'fr-Fr',
  // };
  const [activeLocale, setActiveLocale] = useState('en-US');

  useEffect(() => {
    const isSystemInDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const mode =
      (localStorage.getItem('activeTheme') as ModeType) ?? isSystemInDarkMode
        ? 'dark'
        : 'light';
    modeDispatch({ type: mode === 'dark' ? 'USE_DARK' : 'USE_LIGHT' });
    // TODO: see how to match locales with supported locales and initiate it.
    setActiveLocale(navigator.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IntlProvider
      messages={activeMessages}
      locale={activeLocale}
      defaultLocale="en-US"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Toaster theme={activeMode} closeButton />
        <UserContextProvider>
          <ThemeProvider theme={useTheme()}>{children}</ThemeProvider>
        </UserContextProvider>
      </LocalizationProvider>
    </IntlProvider>
  );
};

export function XafpayThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: process.env.NODE_ENV === 'development',
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContextProvider>
        <ModeContextProvider>
          <>
            <CssBaseline />
            <TempApp>{children}</TempApp>
          </>
        </ModeContextProvider>
      </LanguageContextProvider>
    </QueryClientProvider>
  );
}

export default XafpayThemeProvider;
