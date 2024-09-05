import { Box } from '@mui/material';
import React from 'react';

export default function SplashScreen() {
  return (
    <Box
      sx={{
        background: 'url(/assets/splash_bg.png)',
        height: '100%',
        widht: '100%',
        display: 'grid',
        justifyItems: 'center',
        alignItems: 'center',
      }}
    >
      SplashScreen
    </Box>
  );
}
