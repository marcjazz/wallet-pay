'use client';

import { Box, Button } from '@mui/material';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';

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
      <Button
        variant="contained"
        size="medium"
        fullWidth
        color="primary"
        // disabled
        // startIcon={'s'}
      >
        Hello
      </Button>
      <Footer />
    </Box>
  );
}
