'use client';

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import MainCard from '../../components/Home/MainCard';
import TransactionSection from '../../components/Home/TransactionSection';
import Footer from '../../components/layout/footer/Footer';
import Header from '../../components/layout/header/Header';
import TransactionHistory from '../../components/transaction/TransactionHistory';
import WelcomeScreen from '../../components/layout/WelcomeScreen';

export default function Index() {
  const [isAllHistoryOpen, setIsAllHistoryOpen] = useState<boolean>(false);
  const [shouldShowWelcomeScreen, setShouldShowWelcomeScreen] = useState(true);

  useEffect(() => {
    setShouldShowWelcomeScreen(
      !localStorage.getItem('shouldShowWelcomeScreen')
    );
  }, []);

  const handleWelcomeScreenSwipe = () => {
    setShouldShowWelcomeScreen(false);
    localStorage.setItem('shouldShowWelcomeScreen', 'false');
  };

  return shouldShowWelcomeScreen ? (
    <WelcomeScreen handleSwipe={handleWelcomeScreenSwipe} />
  ) : (
    <>
      <TransactionHistory
        isMenuOpen={isAllHistoryOpen}
        handleClose={() => setIsAllHistoryOpen(false)}
      />
      <Box
        sx={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100%' }}
      >
        <Box
          sx={{
            padding: 2,
            paddingBottom: 0,
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            alignItems: 'start',
            rowGap: 3,
          }}
        >
          <Header />
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
              rowGap: 4,
              height: '100%',
            }}
          >
            <MainCard />
            <TransactionSection
              openAllHistory={() => setIsAllHistoryOpen(true)}
            />
          </Box>
        </Box>
        <Footer />
      </Box>
    </>
  );
}
