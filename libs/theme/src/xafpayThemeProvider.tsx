import { CssBaseline, responsiveFontSizes, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { Bounce, ToastContainer } from 'react-toastify';
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
  const { modeDispatch } = useMode();
  const { activeLanguage } = useLanguage();
  const activeMessages = activeLanguage === 'En' ? enMessages : frMessages;

  useEffect(() => {
    const isSystemInDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const mode =
      (localStorage.getItem('activeTheme') as ModeType) ?? isSystemInDarkMode
        ? 'dark'
        : 'light';
    modeDispatch({ type: mode === 'dark' ? 'USE_DARK' : 'USE_LIGHT' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IntlProvider
      messages={activeMessages}
      locale={activeLanguage}
      defaultLocale="En"
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <UserContextProvider>
          <ThemeProvider
            theme={responsiveFontSizes(useTheme(), {
              factor: 50,
              breakpoints: ['mobile', 'tablet', 'laptop', 'desktop'],
            })}
          >
            {children}
          </ThemeProvider>
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
            <ToastContainer
              position="top-right"
              autoClose={5000}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              transition={Bounce}
            />
            <CssBaseline />
            <TempApp>{children}</TempApp>
          </>
        </ModeContextProvider>
      </LanguageContextProvider>
    </QueryClientProvider>
  );
}

export default XafpayThemeProvider;
