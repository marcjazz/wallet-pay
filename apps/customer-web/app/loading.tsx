import { Box, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import * as animatedLogo from '../public/lottie/logo.json';

const Lottie = dynamic(() => import('react-lottie').then(mod => mod.default), { ssr: false });

export default function SplashScreen() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animatedLogo,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };
  return (
    <Box
      sx={{
        background: 'url(/assets/splash_bg.png)',
        height: '100%',
        width: '100%',
        display: 'grid',
        justifyItems: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Lottie options={defaultOptions} height={140} width={140} />
      <Typography
        variant="l2r"
        sx={{
          color: '#415058',
          textAlign: 'center',
          position: 'absolute',
          bottom: '53px',
          fontFamily: 'DM Sans',
          opacity: 0.75,
        }}
      >
        By GLOM
      </Typography>
    </Box>
  );
}
