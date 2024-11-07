'use client';

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import MainCard from '../components/Home/MainCard';
import TransactionSection from '../components/Home/TransactionSection';
import Footer from '../components/layout/footer/Footer';
import Header from '../components/layout/header/Header';
import WelcomeScreen from '../components/layout/WelcomeScreen';
import TransactionHistory from '../components/transaction/TransactionHistory';

export default function Index() {
  const [isAllHistoryOpen, setIsAllHistoryOpen] = useState<boolean>(false);
  const [shouldShowWelcomeScreen, setShouldShowWelcomeScreen] =
    useState<boolean>(true);

  useEffect(() => {
    setShouldShowWelcomeScreen(
      !localStorage.getItem('shouldShowWelcomeScreen')
    );
  }, []);

  return (
    <>
      {shouldShowWelcomeScreen && (
        <WelcomeScreen
          handleSwipe={() => {
            setShouldShowWelcomeScreen(false);
            localStorage.setItem('shouldShowWelcomeScreen', 'false');
          }}
        />
      )}
      <TransactionHistory
        isMenuOpen={isAllHistoryOpen}
        handleClose={() => setIsAllHistoryOpen(false)}
      />
      <Box
        sx={{
          padding: 2,
          height: '100%',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
          alignItems: 'start',
          rowGap: 3,
        }}
      >
        <Header />
        <Box sx={{ display: 'grid', gridTemplateRows: 'auto 1fr', rowGap: 4 }}>
          <MainCard />
          <TransactionSection
            openAllHistory={() => setIsAllHistoryOpen(true)}
          />
        </Box>
        <Footer />
      </Box>
    </>
  );
}
