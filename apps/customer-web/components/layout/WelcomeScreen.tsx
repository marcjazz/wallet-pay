'use client';

import { Box, Button, keyframes, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight } from 'react-feather';

const swipeLeft = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
`;

export default function WelcomeScreen() {
  const [swipe, setSwipe] = useState<boolean>(false);
  const { push } = useRouter();

  const handleSwipe = () => {
    setSwipe(true);
    setTimeout(() => {
      push('/new-route');
    }, 600);
  };
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        position: 'relative',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        rowGap: '50px',
        padding: '0 16px',
        animation: swipe ? `${swipeLeft} 0.6s ease-out forwards` : 'none',
      }}
    >
      <Box
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '90px' }}
      >
        <Image
          src="/assets/logo.png"
          alt="logo xafpay"
          height={140}
          width={140}
        />
      </Box>
      <Typography
        variant="h1"
        sx={{
          fontFamily: 'Darker Grotesque',
          fontSize: '60px',
          fontWeight: '600',
          lineHeight: '68.4px',
          color: 'black',
          width: '85%',
        }}
      >
        Send money at{' '}
        <Typography
          component="span"
          sx={{
            fontFamily: 'Darker Grotesque',
            fontSize: '60px',
            fontWeight: '600',
            lineHeight: '68.4px',
            width: '85%',
            color: '#F1AC42',
          }}
        >
          unbeatable
        </Typography>{' '}
        rates
      </Typography>
      <Button
        size="small"
        color="inherit"
        variant="text"
        endIcon={<ArrowRight />}
        sx={{ position: 'absolute', left: '16px', bottom: '65px' }}
        onClick={handleSwipe}
      >
        Click to swipe
      </Button>

      <Image
        src="/assets/welcome_screen_img.png"
        alt="welcome-screen-img"
        height={531}
        width={249}
        style={{
          position: 'absolute',
          right: '0',
          bottom: '0',
          zIndex: -1,
        }}
      />
    </Box>
  );
}
