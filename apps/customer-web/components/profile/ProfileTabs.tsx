'use client';

import { Box, Button, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { useTheme } from '@mui/material/styles';

export type TabType = 'overview' | 'edit';

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

/**
 * Tab navigation component for the profile page.
 */
export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const tabs = [
    { id: 'overview' as const, label: formatMessage({ id: 'overview' }) },
    { id: 'edit' as const, label: formatMessage({ id: 'editInformation' }) },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: 'white',
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
        padding: '0 16px',
      }}
    >
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          sx={{
            textTransform: 'none',
            padding: '16px 0',
            marginRight: '24px',
            minWidth: 'auto',
            borderRadius: 0,
            borderBottom: activeTab === tab.id ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Typography
            variant="p2m"
            sx={{
              color: activeTab === tab.id 
                ? theme.palette.text.primary 
                : theme.palette.grey[600],
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
          >
            {tab.label}
          </Typography>
        </Button>
      ))}
    </Box>
  );
}