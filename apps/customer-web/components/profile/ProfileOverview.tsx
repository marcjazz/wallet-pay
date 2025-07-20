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
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}
    >
      <Typography
        variant="p3r"
        sx={{
          color: theme.palette.text.primary,
          marginBottom: '4px',
          display: 'block'
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="p2r"
        sx={{
          color: theme.palette.grey[600],
          wordBreak: 'break-word'
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
  const { formatMessage, formatDate } = useIntl();

  return (
    <Box
      sx={{
        padding: '16px',
        backgroundColor: 'white',
        display: 'grid',
        rowGap: '32px'
      }}
    >
      <Typography variant="p1m" sx={{ color: 'rgba(177, 172, 165, 1)' }}>
        {formatMessage({ id: 'personalInformations' })}
      </Typography>
      <Grid container direction="column">
        <Grid item>
          <ProfileField
            label={formatMessage({ id: 'firstName' })}
            value={user.first_name}
          />
        </Grid>

        <Grid item>
          <ProfileField
            label={formatMessage({ id: 'lastName' })}
            value={user.last_name}
          />
        </Grid>

        <Grid item>
          <ProfileField
            label={formatMessage({ id: 'dateOfBirth' })}
            value={formatDate(user.birthdate, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          />
        </Grid>

        <Grid item>
          <ProfileField
            label={formatMessage({ id: 'email' })}
            value={user.email}
          />
        </Grid>

        <Grid item>
          <ProfileField
            label={formatMessage({ id: 'phoneNumber' })}
            value={user.phone_number}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
