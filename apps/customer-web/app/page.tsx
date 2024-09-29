'use client';

import { Box, Button } from '@mui/material';
import Header from '../components/layout/header/Header';

export default function Index() {
  return (
    <Box sx={{ padding: 2 }}>
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
    </Box>
  );
}
