'use client';

import { Box, Typography, Grid } from '@mui/material';
import { useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';
import { UserEntity } from '../../api/types';

interface ProfileOverviewProps {
  user: UserEntity;
}

interface ProfileFieldProps {
  label: string;
  value: string;
}

/**
 * Individual profile field component.
 */
function ProfileField({ label, value }: ProfileFieldProps) {
  const theme = useTheme();
  
  return (
    <Box sx={{ marginBottom: '16px' }}>
      <Typography
        variant="p3r"
        sx={{
          color: theme.palette.grey[600],
          marginBottom: '4px',
          display: 'block',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="p2r"
        sx={{
          color: theme.palette.text.primary,
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/**
 * Overview tab component displaying read-only user information.
 */
export default function ProfileOverview({ user }: ProfileOverviewProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Generate username from first and last name
  const username = `${user.first_name} ${user.last_name}`;

  return (
    <Box
      sx={{
        padding: '16px',
        backgroundColor: 'white',
        minHeight: 'calc(100vh - 200px)', // Adjust based on header/tabs height
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <ProfileField
            label={formatMessage({ id: 'username' })}
            value={username}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <ProfileField
            label={formatMessage({ id: 'firstName' })}
            value={user.first_name}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <ProfileField
            label={formatMessage({ id: 'lastName' })}
            value={user.last_name}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <ProfileField
            label={formatMessage({ id: 'dateOfBirth' })}
            value={formatDate(user.birthdate)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <ProfileField
            label={formatMessage({ id: 'email' })}
            value={user.email}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <ProfileField
            label={formatMessage({ id: 'phoneNumber' })}
            value={user.phone_number}
          />
        </Grid>
      </Grid>
    </Box>
  );
}