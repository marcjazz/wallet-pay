'use client';

import { Box, IconButton, Switch, Tooltip, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'react-feather';
import { useIntl } from 'react-intl';
import Footer from '../../components/layout/footer/Footer';

export default function PreferredLanguage() {
  const { formatMessage } = useIntl();
  const { push } = useRouter();

  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: 2,
        height: '100%',
        gridTemplateRows: '1fr auto',
      }}
    >
      <Box
        sx={{
          padding: 2,
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          rowGap: 5,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            columnGap: 2,
          }}
        >
          <Tooltip title={formatMessage({ id: 'back' })}>
            <IconButton
              size="small"
              onClick={() => push('/')}
              sx={{
                padding: 0,
              }}
            >
              <ChevronLeft color="#1F2223" />
            </IconButton>
          </Tooltip>

          <Typography variant="h3">
            {formatMessage({ id: 'preferredLanguage' })}
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', rowGap: 1, alignSelf: 'start' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: 2,
              alignItems: 'center',
              justifyItems: 'end',
              padding: 1,
            }}
          >
            <Typography variant="p1m" color="primary">
              {formatMessage({ id: 'english' })}
            </Typography>
            <Switch
              defaultChecked
              size="small"
              disabled
              sx={{
                '& .MuiSwitch-track': {
                  backgroundColor: '#E8F2FF',
                  opacity: '1 !important',
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: 2,
              alignItems: 'center',
              justifyItems: 'end',
              padding: 1,
            }}
          >
            <Typography variant="p1m">
              {formatMessage({ id: 'french' })}
            </Typography>
            <Typography variant="p1m" color="#BABDBE">
              {formatMessage({ id: 'comingSoon' })}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              columnGap: 2,
              alignItems: 'center',
              justifyItems: 'end',
              padding: 1,
            }}
          >
            <Typography variant="p1m">
              {formatMessage({ id: 'german' })}
            </Typography>
            <Typography variant="p1m" color="#BABDBE">
              {formatMessage({ id: 'comingSoon' })}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
