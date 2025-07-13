'use client';
import { Box, Typography, Button } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background, #fff)',
        textAlign: 'center',
        px: 2,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <SentimentDissatisfiedIcon sx={{ fontSize: 120, color: '#232792' }} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Darker Grotesque, DM Sans, sans-serif' }}>
        Oops! Page Not Found
      </Typography>
      <Typography variant="p1r" sx={{ color: '#415058', opacity: 0.8, mb: 3 }}>
        The page you are looking for doesn’t exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 600, fontFamily: 'DM Sans' }}
        onClick={() => router.push('/')}
      >
        Go Home
      </Button>
    </Box>
  );
}
