'use client';

import { Box, Typography, IconButton } from '@mui/material';
import { ArrowLeft } from 'react-feather';
import { useRouter } from 'next/navigation';
import { useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';

/**
 * Header component for the profile page with back button and title.
 */
export default function ProfileHeader() {
  const { formatMessage } = useIntl();
  const router = useRouter();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: 'white',
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
      }}
    >
      <IconButton
        onClick={() => router.back()}
        sx={{
          padding: '8px',
          marginRight: '12px',
          color: theme.palette.text.primary,
        }}
      >
        <ArrowLeft size={20} />
      </IconButton>
      
      <Typography
        variant="h3"
        sx={{
          fontWeight: 600,
          color: theme.palette.text.primary,
          flex: 1,
          textAlign: 'center',
          marginRight: '40px', // Compensate for back button to center title
        }}
      >
        {formatMessage({ id: 'profile' })}
      </Typography>
    </Box>
  );
}