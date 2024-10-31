'use client';

import { Box } from '@mui/material';
import MainCard from '../components/Home/MainCard';
import TransactionSection from '../components/Home/TransactionSection';
import Footer from '../components/layout/footer/Footer';
import Header from '../components/layout/header/Header';

export default function Index() {
  return (
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
        <TransactionSection />
      </Box>
      <Footer />
    </Box>
  );
}
