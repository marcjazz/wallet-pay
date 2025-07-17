'use client';

import { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';
import { useUserProfile } from '../../../api/hooks/useUser';
import ProfileHeader from '../../../components/profile/ProfileHeader';
import ProfileTabs, { TabType } from '../../../components/profile/ProfileTabs';
import ProfileOverview from '../../../components/profile/ProfileOverview';
import ProfileEdit from '../../../components/profile/ProfileEdit';

/**
 * Main profile page component with tab navigation.
 */
export default function ProfilePage() {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const { data: user, isLoading, error } = useUserProfile();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Handle successful profile update
  const handleSaveSuccess = () => {
    setActiveTab('overview');
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: theme.palette.grey[50],
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: theme.palette.grey[50],
          padding: '16px',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: theme.palette.error.main,
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {formatMessage({ id: 'errorLoadingProfile' })}
        </Typography>
        <Typography
          variant="p2r"
          sx={{
            color: theme.palette.text.secondary,
            textAlign: 'center',
          }}
        >
          {formatMessage({ id: 'tryAgainLater' })}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.grey[50],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <ProfileHeader />

      {/* Tab Navigation */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <Box sx={{ flex: 1 }}>
        {activeTab === 'overview' && <ProfileOverview user={user} />}
        {activeTab === 'edit' && (
          <ProfileEdit
            user={user}
            onSaveSuccess={handleSaveSuccess}
          />
        )}
      </Box>
    </Box>
  );
}