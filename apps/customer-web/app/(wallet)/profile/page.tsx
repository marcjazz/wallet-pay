'use client';

import { Box, CircularProgress, Tab, Tabs } from '@mui/material';
import { ReactElement, useState } from 'react';
import { Edit as EditIcon, FileText as FileTextIcon } from 'react-feather';
import { useIntl } from 'react-intl';
import { useUserProfile } from '../../../api/hooks/useUser';
import { UserEntity } from '../../../api/types';
import Footer from '../../../components/layout/footer/Footer';
import ProfileEdit from '../../../components/profile/ProfileEdit';
import ProfileOverview from '../../../components/profile/ProfileOverview';
import Header from '../../../components/shared/header';

interface ITabPanel {
  label: string;
  tabIcon: ReactElement;
}
export default function ProfilePage() {
  const { formatMessage } = useIntl();
  const { data: user, isLoading: isUserProfileLoading } = useUserProfile();
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleSaveSuccess = () => {
    setActiveTab(0);
  };

  const tabsLabel: ITabPanel[] = [
    {
      label: formatMessage({ id: 'overview' }),
      tabIcon: <EditIcon size={16} />
    },
    {
      label: formatMessage({ id: 'editInformation' }),
      tabIcon: <FileTextIcon size={16} />
    }
  ];

  const profileTabs: Record<number, JSX.Element> = {
    0: <ProfileOverview user={user as UserEntity} />,
    1: (
      <ProfileEdit
        user={user as UserEntity}
        onSaveSuccess={handleSaveSuccess}
      />
    )
  };
  return (
    <Box
      sx={{
        display: 'grid',
        height: '100%',
        gridTemplateRows: '1fr auto'
      }}
    >
      <Box
        sx={{
          padding: 2,
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          rowGap: 5,
          overflow: 'auto'
        }}
      >
        <Header label="profile" />
        <Box>
          <Tabs
            centered
            value={activeTab}
            onChange={(_, tabIndex) => setActiveTab(tabIndex)}
            sx={{
              '& .MuiTabs-indicator': {
                display: 'none' // Hide default indicator
              },
              '& .MuiTabs-flexContainer': {
                gap: '10px'
              },
              bgcolor: 'rgba(190, 197, 197, 0.3)',
              borderRadius: '10px',
              marginBottom: '32px'
            }}
          >
            {tabsLabel.map(({ label, tabIcon }, index) => (
              <Tab
                key={`tab-${index}`}
                label={label}
                icon={tabIcon}
                iconPosition="start"
                sx={{
                  textTransform: 'none'
                }}
              />
            ))}
          </Tabs>
          {isUserProfileLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '70%'
              }}
            >
              <CircularProgress thickness={23} color="primary" />
            </Box>
          ) : (
            profileTabs[activeTab]
          )}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
